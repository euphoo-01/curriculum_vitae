<script setup lang="ts">
import type { VForm } from 'vuetify/components';

interface Props {
  modelValue: boolean;
  loading?: boolean;
  editData?: {
    id: string;
    name: string;
    native_name?: string | null;
    iso2: string;
  } | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (
    e: 'submit',
    formData: { id?: string; name: string; native_name?: string; iso2: string }
  ): void;
}>();

const { t } = useI18n();

const formRef = ref<VForm | null>(null);
const form = ref({
  name: '',
  native_name: '',
  iso2: '',
});

const rules = {
  required: (value: string | null | undefined) =>
    !!value || t('common.validation.required'),
  iso2: (value: string) =>
    (value && value.length === 2) || t('common.validation.required'), // Should be exactly 2
};

watch(
  () => props.modelValue,
  (val) => {
    if (val && props.editData) {
      form.value = {
        name: props.editData.name,
        native_name: props.editData.native_name || '',
        iso2: props.editData.iso2,
      };
    } else if (val && !props.editData) {
      form.value = {
        name: '',
        native_name: '',
        iso2: '',
      };
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
    native_name: form.value.native_name,
    iso2: form.value.iso2,
  });
};
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500"
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
              <v-text-field
                v-model="form.name"
                :label="t('languages.name')"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                required
              ></v-text-field>
              <v-text-field
                v-model="form.native_name"
                :label="t('languages.nativeName')"
                variant="outlined"
                density="compact"
              ></v-text-field>
              <v-text-field
                v-model="form.iso2"
                :label="t('languages.iso2')"
                variant="outlined"
                density="compact"
                :rules="[rules.iso2]"
                required
                maxlength="2"
              ></v-text-field>
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
