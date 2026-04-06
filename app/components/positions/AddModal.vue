<script setup lang="ts">
import type { PositionEditData, PositionFormData } from '~/types/positions';

interface Props {
  modelValue: boolean;
  loading?: boolean;
  editData?: PositionEditData | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', formData: PositionFormData): void;
}>();

const { t } = useI18n();

const { formRef, form, close, submit } = useDomainForm<
  PositionFormData,
  PositionEditData
>(props, emit, {
  initialData: () => ({ name: '' }),
  mapEditData: (data) => ({ name: data.name }),
});

const rules = {
  required: (value: string | null | undefined) =>
    !!value || t('common.validation.required'),
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
                :label="t('common.fields.position')"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                required
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
