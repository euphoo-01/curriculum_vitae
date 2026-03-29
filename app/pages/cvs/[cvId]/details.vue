<template>
  <div class="flex-grow-1 d-flex flex-column pb-4 m-0 bg-background h-screen">
    <div class="d-flex flex-column bg-background shadow-sm mb-4 px-4">
      <LayoutBreadcrumbs class="flex-none" />
      <CvsTabs />
    </div>

    <div v-if="loading" class="d-flex justify-center align-center flex-grow-1">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-card
      v-else-if="currentCv"
      flat
      rounded
      class="mx-4 pa-4 overflow-scroll min-h-0"
    >
      <v-snackbar
        v-model="isSnackbar"
        location="top"
        :color="snackbarColor"
        :timeout="3000"
      >
        {{ actionMessage }}
      </v-snackbar>

      <v-form
        ref="formRef"
        validate-on="submit lazy"
        @submit.prevent="handleSubmit"
      >
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.name"
                :label="t('cvs.name')"
                variant="outlined"
                density="compact"
                :readonly="!canEdit"
                :rules="[rules.required]"
                required
              ></v-text-field>

              <v-text-field
                v-model="form.education"
                label="Education"
                variant="outlined"
                density="compact"
                :readonly="!canEdit"
              ></v-text-field>

              <v-textarea
                v-model="form.description"
                :label="t('cvs.description')"
                variant="outlined"
                density="compact"
                :readonly="!canEdit"
                :rules="[rules.required]"
                required
              ></v-textarea>
            </v-col>
          </v-row>
        </v-container>

        <v-card-actions v-if="canEdit" class="px-4">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            rounded
            type="submit"
            class="px-8"
            :loading="loadingAction"
          >
            {{ t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { VForm } from 'vuetify/components';
import { UserRole } from '~~/graphql/generated/graphql';

const { t } = useI18n();
const { setBreadcrumbs } = useBreadcrumbs();
const route = useRoute();
const cvId = route.params.cvId as string;

const { user: currentUser } = useAuth();
const { currentCv, loading, fetchCv, updateCv } = useCvs();

const formRef = ref<VForm | null>(null);
const form = ref({
  name: '',
  education: '',
  description: '',
});

const isSnackbar = ref(false);
const actionMessage = ref('');
const snackbarColor = ref('error');
const loadingAction = ref(false);

const rules = {
  required: (value: unknown) => !!value || t('fieldRequired'),
};

const canEdit = computed(() => {
  if (!currentUser.value || !currentCv.value) return false;
  return (
    currentUser.value.role === UserRole.Admin ||
    String(currentCv.value.user?.id) === String(currentUser.value.id)
  );
});

const handleSubmit = async () => {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loadingAction.value = true;
  try {
    await updateCv({
      cvId,
      name: form.value.name,
      education: form.value.education,
      description: form.value.description,
    });
    actionMessage.value = t('common.update');
    snackbarColor.value = 'success';
    isSnackbar.value = true;
  } catch (e) {
    actionMessage.value = e instanceof Error ? e.message : 'Error';
    snackbarColor.value = 'error';
    isSnackbar.value = true;
  } finally {
    loadingAction.value = false;
  }
};

onMounted(async () => {
  const cv = await fetchCv(cvId);
  if (cv) {
    form.value = {
      name: cv.name,
      education: cv.education || '',
      description: cv.description,
    };

    setBreadcrumbs([
      { title: t('sidebarCVs'), to: '/cvs' },
      { title: cv.name, disabled: true },
    ]);
  }
});
</script>
