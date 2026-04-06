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
            :label="t('skills.name')"
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
            {{ t('common.actions.add') }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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

const { formRef, form, close, submit } = useDomainForm<
  { name: string; mastery: Mastery | null },
  unknown,
  { name: string; mastery: Mastery }
>(props, emit, {
  initialData: () => ({ name: '', mastery: null }),
  mapEditData: () => ({ name: '', mastery: null }),
});

const rules = {
  required: (value: unknown) => !!value || t('common.validation.required'),
};

const masteryOptions = computed(() => [
  { title: t('mastery.Novice'), value: Mastery.Novice },
  { title: t('mastery.Advanced'), value: Mastery.Advanced },
  { title: t('mastery.Competent'), value: Mastery.Competent },
  { title: t('mastery.Proficient'), value: Mastery.Proficient },
  { title: t('mastery.Expert'), value: Mastery.Expert },
]);
</script>
