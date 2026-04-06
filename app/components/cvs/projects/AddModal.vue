<script setup lang="ts">
import type { GetProjectsQuery } from '~~/graphql/generated/graphql';
import type { CvProjectEditData, CvProjectFormData } from '~/types/cvs';

interface Props {
  modelValue: boolean;
  loading?: boolean;
  editData?: CvProjectEditData | null;
  projects: GetProjectsQuery['projects'];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', formData: CvProjectFormData): void;
}>();

const { t } = useI18n();

const { formRef, form, close, submit } = useDomainForm<
  CvProjectFormData,
  CvProjectEditData
>(props, emit, {
  initialData: () => ({
    projectId: '',
    start_date: '',
    end_date: '',
    roles: [],
    responsibilities: [],
  }),
  mapEditData: (data) => ({
    projectId: data.projectId,
    start_date: (data.start_date || '').split('T')[0] as string,
    end_date: (data.end_date || '').split('T')[0] as string,
    roles: [...data.roles],
    responsibilities: [...data.responsibilities],
  }),
  prepareSubmitData: (formData) => ({
    projectId: formData.projectId,
    start_date: new Date(formData.start_date).toISOString(),
    end_date: formData.end_date
      ? new Date(formData.end_date).toISOString()
      : undefined,
    roles: formData.roles,
    responsibilities: formData.responsibilities,
  }),
});

const rules = {
  required: (value: unknown) => !!value || t('common.validation.required'),
};
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="700"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="p-4">
      <v-card-title class="px-4 text-h5">{{
        editData ? t('common.actions.update') : t('common.actions.add')
      }}</v-card-title>

      <v-form ref="formRef" validate-on="submit lazy" @submit.prevent="submit">
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="form.projectId"
                :items="projects"
                item-title="name"
                item-value="id"
                :label="t('projects.project')"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                :readonly="!!editData"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.start_date"
                :label="t('projects.startDate')"
                type="date"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.end_date"
                :label="t('projects.endDate')"
                type="date"
                variant="outlined"
                density="compact"
                clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-combobox
                v-model="form.roles"
                :label="t('cvPreview.roles')"
                multiple
                chips
                variant="outlined"
                density="compact"
                :hint="t('common.hints.enterToAdd')"
                persistent-hint
                :rules="[rules.required]"
                required
              ></v-combobox>
            </v-col>
            <v-col cols="12">
              <v-combobox
                v-model="form.responsibilities"
                :label="t('cvPreview.responsibilities')"
                multiple
                chips
                variant="outlined"
                density="compact"
                :hint="t('common.hints.enterToAdd')"
                persistent-hint
                :rules="[rules.required]"
                required
              ></v-combobox>
            </v-col>
          </v-row>
        </v-container>

        <v-card-actions class="px-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            size="large"
            rounded
            class="px-8"
            :disabled="loading"
            @click="close"
          >
            {{ t('common.actions.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            rounded
            type="submit"
            class="px-8"
            :loading="loading"
          >
            {{
              editData ? t('common.actions.save') : t('common.actions.create')
            }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
