<template>
  <div class="flex-grow-1 flex flex-col pb-4 m-0 bg-background h-screen">
    <div class="flex flex-col bg-background px-4">
      <LayoutBreadcrumbs class="flex-none" />
      <div class="flex justify-between items-center">
        <CvsTabs />
        <v-btn
          color="primary"
          variant="outlined"
          size="large"
          rounded
          class="px-8 mb-2"
          :loading="exporting"
          @click="handleExportPdf"
        >
          {{ t('cvPreview.exportPdf') }}
        </v-btn>
      </div>
    </div>

    <div v-if="loadingCv" class="flex justify-center align-center flex-grow">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-card
      v-else-if="currentCv"
      flat
      rounded
      class="flex flex-col flex-grow min-h-0 w-full overflow-y-auto"
    >
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
        class="bg-surface text-on-surface mx-auto cv-print-area"
        style="width: 210mm; min-height: 297mm; padding: 20mm"
      >
        <v-row class="justify-between mb-4 items-center">
          <v-col>
            <h1 class="mb-0">
              {{ currentCv.user?.profile?.full_name || currentCv.user?.email }}
            </h1>
            <h3 class="m-0">
              {{ currentCv.user?.position_name?.toUpperCase() }}
            </h3>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="4">
            <h3>{{ t('cvPreview.education') }}</h3>
            <p>{{ currentCv.education }}</p>
            <h3>{{ t('cvPreview.languageProficiency') }}</h3>
            <ul class="m-0 p-0 list-none">
              <li v-for="lang in currentCv.languages" :key="lang.name">
                {{ lang.name }} - {{ lang.proficiency }}
              </li>
            </ul>
            <h3>{{ t('cvPreview.domains') }}</h3>
            <ul class="m-0 p-0 list-none">
              <li v-for="proj in currentCv.projects" :key="proj.id">
                {{ proj.domain }}
              </li>
            </ul>
          </v-col>

          <v-divider
            color="primary"
            thickness="2"
            variant="solid"
            opacity="1"
            vertical
          ></v-divider>

          <v-col>
            <h3>{{ currentCv.name }}</h3>
            <p>{{ currentCv.description }}</p>
            <div
              v-for="category in categoriesWithSkills.slice(0, 3)"
              :key="category.id"
              style="margin-bottom: 10px"
            >
              <strong style="display: block; margin-bottom: 5px">{{
                category.name
              }}</strong>
              <p>{{ category.skills.map((skill) => skill.name).join(', ') }}</p>
            </div>
          </v-col>
        </v-row>

        <h1>{{ t('cvPreview.projects') }}</h1>

        <v-row
          v-for="proj in currentCv?.projects"
          :key="proj.id"
          class="project-row"
        >
          <v-col cols="4">
            <h3 style="color: var(--v-theme-primary)">
              {{ proj.name.toUpperCase() }}
            </h3>
            <p>{{ proj.description }}</p>
          </v-col>
          <v-divider
            color="primary"
            thickness="2"
            opacity="1"
            variant="solid"
            vertical
          ></v-divider>
          <v-col>
            <h3>{{ t('cvPreview.projectRoles') }}</h3>
            <p>{{ proj.roles.join(', ') }}</p>
            <h3>{{ t('cvPreview.period') }}</h3>
            <p>
              {{ proj.start_date }} -
              {{ proj.end_date || t('common.time.tillNow') }}
            </p>
            <h3>{{ t('cvPreview.responsibilities') }}</h3>
            <ul>
              <li v-for="(resp, index) in proj.responsibilities" :key="index">
                {{ resp }}
              </li>
            </ul>
            <h3>{{ t('cvPreview.environment') }}</h3>
            <p>{{ proj.environment.join(', ') }}</p>
          </v-col>
        </v-row>

        <h1>{{ t('cvPreview.professionalSkills') }}</h1>
        <v-table class="mt-4 bg-transparent skills-table-print">
          <thead>
            <tr class="border-b border-primary border-solid">
              <th class="text-uppercase font-weight-bold text-caption pr-4">
                {{ t('cvPreview.skills') }}
              </th>
              <th class="px-4"></th>
              <th
                class="text-uppercase font-weight-bold text-caption text-center px-4"
              >
                {{ t('cvPreview.experienceInYears') }}
              </th>
              <th
                class="text-uppercase font-weight-bold text-caption text-right pl-4"
              >
                {{ t('cvPreview.lastUsed') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <template
              v-for="category in categoriesWithSkills"
              :key="category.id"
            >
              <tr class="category-row">
                <td>{{ category.name }}</td>
                <td>
                  <ul class="list-none">
                    <li v-for="(skill, index) in category.skills" :key="index">
                      {{ skill.name }}
                    </li>
                  </ul>
                </td>
                <td class="text-center">-</td>
                <td class="text-center">-</td>
              </tr>
            </template>
          </tbody>
        </v-table>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { GetCvQuery } from '~~/graphql/generated/graphql';

type Skill = NonNullable<GetCvQuery['cv']>['skills'][number];

interface CategoryWithSkills {
  id: string;
  name: string;
  skills: Skill[];
  order: number;
}

const dictionariesStore = useDictionariesStore();
const cvsStore = useCvsStore();
const { categoriesList } = storeToRefs(dictionariesStore);
const { currentCv, loading: loadingCv } = storeToRefs(cvsStore);

const { t } = useI18n();
useSeoMeta({
  title: t('seo.cvPreview.title'),
  ogTitle: t('seo.cvPreview.title'),
  description: t('seo.cvPreview.description'),
  ogDescription: t('seo.cvPreview.description'),
});
const { setBreadcrumbs } = useBreadcrumbs();
const route = useRoute();
const cvId = route.params.cvId as string;

const exporting = ref(false);
const previewRef = ref<HTMLElement | null>(null);

const isSnackbar = ref(false);
const actionMessage = ref('');
const snackbarColor = ref('success');

const categoriesWithSkills = computed<CategoryWithSkills[]>(() => {
  if (!currentCv.value) return [];
  const categoryMap = new Map<string, CategoryWithSkills>();

  categoriesList.value.forEach((cat) => {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      skills: [],
      order: cat.order,
    });
  });

  const uncategorizedId = 'uncategorized';
  if (!categoryMap.has(uncategorizedId)) {
    categoryMap.set(uncategorizedId, {
      id: uncategorizedId,
      name: t('skills.uncategorized'),
      skills: [],
      order: 999,
    });
  }

  currentCv.value.skills.forEach((skill) => {
    const target = categoryMap.get(skill.categoryId || uncategorizedId);
    if (target) {
      target.skills.push(skill);
    }
  });

  return Array.from(categoryMap.values())
    .filter((c) => c.skills.length > 0)
    .sort((a, b) => a.order - b.order);
});

const handleExportPdf = async (): Promise<void> => {
  if (!previewRef.value || !currentCv.value) return;
  exporting.value = true;
  try {
    const htmlContent = previewRef.value.outerHTML;

    const styleTags = Array.from(document.querySelectorAll('style'))
      .map((s) => s.textContent)
      .join('\n');

    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColor = computedStyle.getPropertyValue('--v-theme-primary');

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          ${styleTags}
          :root { --v-theme-primary: ${primaryColor}; }
          body { background: white !important; margin: 0; padding: 0; }
          #cv-preview-content {
            box-shadow: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20mm !important;
          }
          .project-row, .category-row {
            page-break-inside: avoid !important;
          }
          h1, h2, h3 { page-break-after: avoid !important; }
          @page { size: A4; margin: 0; }

          .v-divider--vertical {
            border-right: 2px solid var(--v-theme-primary) !important;
            height: auto !important;
            align-self: stretch !important;
          }
        </style>
      </head>
      <body>
        <div class="v-application v-theme--light">
          <div class="v-application__wrap">
            ${htmlContent}
          </div>
        </div>
      </body>
      </html>
    `;

    const base64Pdf = await cvsStore.exportPdf({
      html: fullHtml,
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm',
      },
    });

    if (!base64Pdf) throw new Error('Server returned empty PDF data');

    const binaryString = window.atob(base64Pdf);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCv.value.name || 'CV'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);

    actionMessage.value = t('common.responses.exportSuccess');
    snackbarColor.value = 'success';
    isSnackbar.value = true;
  } catch (e: unknown) {
    actionMessage.value = e instanceof Error ? e.message : String(e);
    snackbarColor.value = 'error';
    isSnackbar.value = true;
  } finally {
    exporting.value = false;
  }
};

onMounted(async () => {
  const [cv] = await Promise.all([
    cvsStore.fetchCv(cvId),
    dictionariesStore.fetchCategories(),
  ]);

  if (cv) {
    setBreadcrumbs([
      { title: t('sidebar.cvs'), to: '/cvs' },
      { title: cv.name, to: `/cvs/${cvId}/details` },
      { title: t('cvs.tabs.preview'), disabled: true },
    ]);
  }
});
</script>

<style scoped>
:deep(.v-table.skills-table-print) {
  background: transparent !important;
}

:deep(.project-row) {
  margin-top: 20px;
  padding-top: 10px;
}
</style>
