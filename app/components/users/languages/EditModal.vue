<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="p-4">
      <v-card-title class="px-4 text-xl">{{
        t('languages.edit')
      }}</v-card-title>

      <v-form ref="formRef" validate-on="submit lazy" @submit.prevent="submit">
        <div class="p-4">
          <v-text-field
            :model-value="editData?.name"
            :label="t('languages.name')"
            variant="outlined"
            density="compact"
            disabled
          ></v-text-field>

          <v-select
            v-model="form.proficiency"
            :items="proficiencyOptions"
            item-title="title"
            item-value="value"
            :label="t('languages.proficiency')"
            variant="outlined"
            density="compact"
            :rules="[rules.required]"
          ></v-select>
        </div>

        <v-card-actions class="px-4 flex items-center">
          <v-btn
            color="primary"
            variant="text"
            size="large"
            rounded
            class="px-4"
            :loading="loading"
            @click="handleDelete"
          >
            {{ t('common.actions.delete') }}
          </v-btn>
          <div class="grow"></div>
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
            {{ t('common.actions.save') }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Proficiency } from '~~/graphql/generated/graphql';
import { useI18n } from 'vue-i18n';

interface Props {
  modelValue: boolean;
  loading?: boolean;
  editData: { name: string; proficiency: Proficiency } | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', data: { name: string; proficiency: Proficiency }): void;
  (e: 'delete'): void;
}>();

const { t } = useI18n();

const { formRef, form, close, submit } = useDomainForm<
  { proficiency: Proficiency | null },
  { name: string; proficiency: Proficiency },
  { name: string; proficiency: Proficiency }
>(props, emit, {
  initialData: () => ({ proficiency: null }),
  mapEditData: (data) => ({ proficiency: data.proficiency }),
  prepareSubmitData: (formData) => {
    if (!formData.proficiency || !props.editData) return undefined;
    return {
      name: props.editData.name,
      proficiency: formData.proficiency,
    };
  },
});

const rules = {
  required: (value: unknown) => !!value || t('common.validation.required'),
};

const proficiencyOptions = computed(() => [
  { title: t('proficiency.A1'), value: Proficiency.A1 },
  { title: t('proficiency.A2'), value: Proficiency.A2 },
  { title: t('proficiency.B1'), value: Proficiency.B1 },
  { title: t('proficiency.B2'), value: Proficiency.B2 },
  { title: t('proficiency.C1'), value: Proficiency.C1 },
  { title: t('proficiency.C2'), value: Proficiency.C2 },
  { title: t('proficiency.Native'), value: Proficiency.Native },
]);

const handleDelete = () => {
  emit('delete');
};
</script>
