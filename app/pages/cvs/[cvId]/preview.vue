<template>
  <div class="flex-grow-1 d-flex flex-column pb-4 m-0 bg-background h-screen">
    <div class="d-flex flex-column bg-background shadow-sm mb-4 px-4">
      <LayoutBreadcrumbs class="flex-none" />
      <CvsTabs />
    </div>

    <div
      v-if="loadingCv"
      class="d-flex justify-center align-center flex-grow-1"
    >
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-card
      v-else-if="currentCv"
      flat
      rounded
      class="mx-4 pa-4 overflow-scroll min-h-0"
    >
      <v-row class="justify-end mb-4 px-4">
        <v-btn
          color="primary"
          prepend-icon="mdi-file-pdf-box"
          :loading="exporting"
          @click="handleExportPdf"
        >
          Export to PDF
        </v-btn>
      </v-row>

      <v-snackbar
        v-model="isSnackbar"
        location="top"
        :color="snackbarColor"
        :timeout="3000"
      >
        {{ actionMessage }}
      </v-snackbar>

      <div
        id="cv-preview-content"
        ref="previewRef"
        class="bg-surface text-on-surface mx-auto"
        style="
          max-width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          font-family: sans-serif;
          line-height: 1.5;
          font-size: 14px;
        "
      >
        <div style="text-align: center; margin-bottom: 20px">
          <h1 style="margin: 0; font-size: 28px">
            {{ currentCv.user?.profile?.full_name || currentCv.user?.email }}
          </h1>
          <h2
            style="
              margin: 5px 0 0;
              font-size: 20px;
              font-weight: normal;
              color: #555;
            "
          >
            {{ currentCv.name }}
          </h2>
        </div>

        <div style="margin-bottom: 20px">
          <p style="margin: 0">{{ currentCv.description }}</p>
        </div>

        <div v-if="currentCv.education" style="margin-bottom: 20px">
          <h3
            style="
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
              margin-bottom: 10px;
            "
          >
            Education
          </h3>
          <p style="margin: 0">{{ currentCv.education }}</p>
        </div>

        <div
          v-if="currentCv.languages && currentCv.languages.length > 0"
          style="margin-bottom: 20px"
        >
          <h3
            style="
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
              margin-bottom: 10px;
            "
          >
            Languages
          </h3>
          <ul style="margin: 0; padding-left: 20px">
            <li v-for="lang in currentCv.languages" :key="lang.name">
              <strong>{{ lang.name }}</strong> - {{ lang.proficiency }}
            </li>
          </ul>
        </div>

        <div
          v-if="currentCv.skills && currentCv.skills.length > 0"
          style="margin-bottom: 20px"
        >
          <h3
            style="
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
              margin-bottom: 10px;
            "
          >
            Skills
          </h3>
          <div
            v-for="category in categoriesWithSkills"
            :key="category.id"
            style="margin-bottom: 10px"
          >
            <strong style="display: block; margin-bottom: 5px">{{
              category.name
            }}</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 5px">
              <span
                v-for="skill in category.skills"
                :key="skill.name"
                style="
                  background: #eee;
                  padding: 2px 8px;
                  border-radius: 12px;
                  font-size: 12px;
                "
              >
                {{ skill.name }} ({{ skill.mastery }})
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="currentCv.projects && currentCv.projects.length > 0"
          style="margin-bottom: 20px"
        >
          <h3
            style="
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
              margin-bottom: 10px;
            "
          >
            Projects
          </h3>
          <div
            v-for="proj in currentCv.projects"
            :key="proj.project.id"
            style="margin-bottom: 15px"
          >
            <h4 style="margin: 0 0 5px">{{ proj.name }}</h4>
            <div style="font-size: 12px; color: #666; margin-bottom: 5px">
              {{ formatDate(proj.start_date) }} -
              {{ formatDate(proj.end_date) }} | {{ proj.domain }}
            </div>
            <p style="margin: 0 0 5px; font-size: 13px">
              {{ proj.description }}
            </p>
            <div
              v-if="proj.roles.length > 0"
              style="font-size: 13px; margin-bottom: 5px"
            >
              <strong>Roles:</strong> {{ proj.roles.join(', ') }}
            </div>
            <div
              v-if="proj.responsibilities.length > 0"
              style="font-size: 13px; margin-bottom: 5px"
            >
              <strong>Responsibilities:</strong>
              <ul style="margin: 0; padding-left: 20px">
                <li v-for="resp in proj.responsibilities" :key="resp">
                  {{ resp }}
                </li>
              </ul>
            </div>
            <div v-if="proj.environment.length > 0" style="font-size: 13px">
              <strong>Environment:</strong> {{ proj.environment.join(', ') }}
            </div>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { setBreadcrumbs } = useBreadcrumbs();
const route = useRoute();
const cvId = route.params.cvId as string;

const cvsStoreInstance = useCvsStore();
const { currentCv, loading: loadingCv } = storeToRefs(cvsStoreInstance);
const { fetchCv, exportPdf } = cvsStoreInstance;
const skillsStoreInstance = useSkillsStore();
const { categoriesList } = storeToRefs(skillsStoreInstance);
const { fetchCategories } = skillsStoreInstance;

const exporting = ref(false);
const previewRef = ref<HTMLElement | null>(null);

const isSnackbar = ref(false);
const actionMessage = ref('');
const snackbarColor = ref('success');

const categoriesWithSkills = computed(() => {
  if (!currentCv.value) return [];
  const categoryMap = new Map<
    string,
    {
      id: string;
      name: string;
      skills: typeof currentCv.value.skills;
      order: number;
    }
  >();

  categoriesList.value.forEach((cat) => {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      skills: [],
      order: cat.order,
    });
  });

  categoryMap.set('uncategorized', {
    id: 'uncategorized',
    name: t('skills.uncategorized'),
    skills: [],
    order: 9999,
  });

  currentCv.value.skills.forEach((skill) => {
    const catId = skill.categoryId || 'uncategorized';
    if (categoryMap.has(catId)) {
      categoryMap.get(catId)!.skills.push(skill);
    } else {
      categoryMap.get('uncategorized')!.skills.push(skill);
    }
  });

  return Array.from(categoryMap.values())
    .filter((c) => c.skills.length > 0)
    .sort((a, b) => a.order - b.order);
});

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return t('common.tillNow', 'Till now');
  return new Date(dateString).toLocaleDateString();
};

const handleExportPdf = async () => {
  if (!previewRef.value) return;
  exporting.value = true;
  try {
    const htmlContent = previewRef.value.outerHTML;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${currentCv.value?.name || 'CV'}</title>
      </head>
      <body style="margin: 0; padding: 0;">
        ${htmlContent}
      </body>
      </html>
    `;

    const base64Pdf = await exportPdf({
      html: fullHtml,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '20mm',
        right: '20mm',
      },
    });

    if (base64Pdf) {
      const binaryString = window.atob(base64Pdf);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentCv.value?.name || 'CV'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      actionMessage.value = 'PDF exported successfully';
      snackbarColor.value = 'success';
      isSnackbar.value = true;
    }
  } catch (e) {
    actionMessage.value =
      e instanceof Error ? e.message : 'Error exporting PDF';
    snackbarColor.value = 'error';
    isSnackbar.value = true;
  } finally {
    exporting.value = false;
  }
};

onMounted(async () => {
  const [cv] = await Promise.all([fetchCv(cvId), fetchCategories()]);

  if (cv) {
    setBreadcrumbs([
      { title: t('sidebarCVs'), to: '/cvs' },
      { title: cv.name, to: `/cvs/${cvId}/details` },
      { title: t('cvs.preview'), disabled: true },
    ]);
  }
});
</script>
