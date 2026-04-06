<script setup lang="ts">
import type { VForm } from 'vuetify/components';

interface Props {
  modelValue: boolean;
  loading?: boolean;
  editData?: {
    id: string;
    name: string;
    internal_name: string;
    domain: string;
    start_date: string;
    end_date?: string | null;
    description: string;
    environment: string[];
  } | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (
    e: 'submit',
    formData: {
      id?: string;
      name: string;
      internal_name: string;
      domain: string;
      start_date: string;
      end_date?: string;
      description: string;
      environment: string[];
    }
  ): void;
}>();

const { t } = useI18n();

const formRef = ref<VForm | null>(null);
const form = ref({
  id: '',
  name: '',
  internal_name: '',
  domain: '',
  start_date: '',
  end_date: '',
  description: '',
  environment: [] as string[],
});

const rules = {
  required: (value: unknown) => !!value || t('common.validation.required'),
};

watch(
  () => props.modelValue,
  (val) => {
    if (val && props.editData) {
      form.value.name = props.editData.name;
      form.value.internal_name = props.editData.internal_name;
      form.value.domain = props.editData.domain;
      form.value.start_date = (props.editData.start_date || '').split(
        'T'
      )[0] as string;
      form.value.end_date = (props.editData.end_date || '').split(
        'T'
      )[0] as string;
      form.value.description = props.editData.description;
      form.value.environment = [...props.editData.environment];
    } else if (val && !props.editData) {
      form.value.name = '';
      form.value.internal_name = '';
      form.value.domain = '';
      form.value.start_date = '';
      form.value.end_date = '';
      form.value.description = '';
      form.value.environment = [];
      formRef.value?.resetValidation();
    }
  }
);

const close = () => emit('update:modelValue', false);

const submit = async () => {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  emit('submit', {
    id: props.editData?.id,
    name: form.value.name,
    internal_name: form.value.internal_name,
    domain: form.value.domain,
    start_date: new Date(form.value.start_date).toISOString(),
    end_date: form.value.end_date
      ? new Date(form.value.end_date).toISOString()
      : undefined,
    description: form.value.description,
    environment: form.value.environment,
  });
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
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name"
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
              <v-textarea
                v-model="form.description"
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
