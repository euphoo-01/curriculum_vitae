<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="p-4">
      <v-card-title class="px-4 text-xl">{{ t('languages.add') }}</v-card-title>

      <v-form ref="formRef" validate-on="submit lazy" @submit.prevent="submit">
        <div class="p-4">
          <v-select
            v-model="form.name"
            :items="languages"
            item-title="name"
            item-value="name"
            :label="t('languages.language')"
            variant="outlined"
            density="compact"
            :rules="[rules.required]"
          ></v-select>

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
          <div class="grow"></div>
          <v-btn
            variant="text"
            size="large"
            rounded
            class="px-8"
            :disabled="loading"
            @click="close"
          >
            {{ t('common.cancel') }}
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
            {{ t('common.add') }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { VForm } from 'vuetify/components';
import { Proficiency } from '~~/graphql/generated/graphql';
import { useI18n } from 'vue-i18n';

interface Props {
  modelValue: boolean;
  loading?: boolean;
  languages: { name: string }[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', data: { name: string; proficiency: Proficiency }): void;
}>();

const { t } = useI18n();

const formRef = ref<VForm | null>(null);
const form = ref<{ name: string; proficiency: Proficiency | null }>({
  name: '',
  proficiency: null,
});

const rules = {
  required: (value: unknown) => !!value || t('fieldRequired'),
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

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      form.value = { name: '', proficiency: null };
      formRef.value?.resetValidation();
    }
  }
);

const close = () => emit('update:modelValue', false);

const submit = async () => {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid || !form.value.name || !form.value.proficiency) return;

  emit('submit', {
    name: form.value.name,
    proficiency: form.value.proficiency,
  });
};
</script>
