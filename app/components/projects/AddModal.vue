<script setup lang="ts">
import type { ProjectEditData, ProjectFormData } from '~/types/projects';

interface Props {
  modelValue: boolean;
  loading?: boolean;
  editData?: ProjectEditData | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', formData: ProjectFormData): void;
}>();

const { t } = useI18n();

const { formRef, form, close, submit } = useDomainForm<
  ProjectFormData,
  ProjectEditData
>(props, emit, {
  initialData: () => ({
    name: '',
    internal_name: '',
    domain: '',
    start_date: '',
    end_date: '',
    description: '',
    environment: [],
  }),
  mapEditData: (data) => ({
    name: data.name,
    internal_name: data.internal_name,
    domain: data.domain,
    start_date: (data.start_date || '').split('T')[0] as string,
    end_date: (data.end_date || '').split('T')[0] as string,
    description: data.description,
    environment: [...data.environment],
  }),
  prepareSubmitData: (formData, editData) => ({
    id: editData?.id,
    name: formData.name,
    internal_name: formData.internal_name,
    domain: formData.domain,
    start_date: new Date(formData.start_date).toISOString(),
    end_date: formData.end_date
      ? new Date(formData.end_date).toISOString()
      : undefined,
    description: formData.description,
    environment: formData.environment,
  }),
});

const rules = {
  required: (value: unknown) => !!value || t('common.validation.required'),
};
</script>

<template>
  <v-dialog
    data-test-id="projects-add-modal"
    :model-value="modelValue"
    max-width="700"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="p-4">
      <v-card-title data-test-id="modal-title" class="px-4 text-h5">{{
        editData ? t('common.actions.update') : t('common.actions.add')
      }}</v-card-title>

      <v-form
        ref="formRef"
        data-test-id="projects-form"
        validate-on="submit lazy"
        @submit.prevent="submit"
      >
        <v-container>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name"
                data-test-id="input-name"
                :label="t('projects.name')"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.internal_name"
                data-test-id="input-internal-name"
                :label="t('projects.internalName')"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.domain"
                data-test-id="input-domain"
                :label="t('projects.domain')"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.start_date"
                data-test-id="input-start-date"
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
                data-test-id="input-end-date"
                :label="t('projects.endDate')"
                type="date"
                variant="outlined"
                density="compact"
                clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                data-test-id="input-description"
                :label="t('projects.description')"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                required
              ></v-textarea>
            </v-col>
            <v-col cols="12">
              <v-combobox
                v-model="form.environment"
                data-test-id="input-environment"
                :label="t('projects.environment')"
                multiple
                chips
                variant="outlined"
                density="compact"
                :hint="t('common.hints.enterToAdd')"
                persistent-hint
              ></v-combobox>
            </v-col>
          </v-row>
        </v-container>

        <v-card-actions class="px-4">
          <v-spacer></v-spacer>
          <v-btn
            data-test-id="cancel-button"
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
            data-test-id="submit-button"
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
