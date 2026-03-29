<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="p-4">
      <v-card-title class="px-4 text-xl">{{ t('skills.add') }}</v-card-title>

      <v-form ref="formRef" validate-on="submit lazy" @submit.prevent="submit">
        <div class="p-4">
          <v-select
            v-model="form.name"
            :items="skills"
            item-title="name"
            item-value="name"
            :label="t('skills.skill')"
            variant="outlined"
            density="compact"
            :rules="[rules.required]"
          ></v-select>

          <v-select
            v-model="form.mastery"
            :items="masteryOptions"
            item-title="title"
            item-value="value"
            :label="t('skills.mastery')"
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
import { Mastery } from '~~/graphql/generated/graphql';
import { useI18n } from 'vue-i18n';

interface Props {
  modelValue: boolean;
  loading?: boolean;
  skills: { name: string; category?: { id: string } | null }[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', data: { name: string; mastery: Mastery }): void;
}>();

const { t } = useI18n();

const formRef = ref<VForm | null>(null);
const form = ref<{ name: string; mastery: Mastery | null }>({
  name: '',
  mastery: null,
});

const rules = {
  required: (value: unknown) => !!value || t('fieldRequired'),
};

const masteryOptions = computed(() => [
  { title: t('mastery.Novice'), value: Mastery.Novice },
  { title: t('mastery.Advanced'), value: Mastery.Advanced },
  { title: t('mastery.Competent'), value: Mastery.Competent },
  { title: t('mastery.Proficient'), value: Mastery.Proficient },
  { title: t('mastery.Expert'), value: Mastery.Expert },
]);

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      form.value = { name: '', mastery: null };
      formRef.value?.resetValidation();
    }
  }
);

const close = () => emit('update:modelValue', false);

const submit = async () => {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid || !form.value.name || !form.value.mastery) return;

  emit('submit', {
    name: form.value.name,
    mastery: form.value.mastery,
  });
};
</script>
