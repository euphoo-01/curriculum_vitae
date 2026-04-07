<script setup lang="ts">
import type { GetSkillCategoriesQuery } from '~~/graphql/generated/graphql';
import type { SkillEditData, SkillFormData } from '~/types/skills';

interface Props {
  modelValue: boolean;
  loading?: boolean;
  editData?: SkillEditData | null;
  categories: GetSkillCategoriesQuery['skillCategories'];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', formData: SkillFormData): void;
}>();

const { t } = useI18n();

const { formRef, form, close, submit } = useDomainForm<
  SkillFormData,
  SkillEditData
>(props, emit, {
  initialData: () => ({ name: '', categoryId: undefined }),
  mapEditData: (data) => ({
    name: data.name,
    categoryId: data.categoryId || undefined,
  }),
});

const rules = {
  required: (value: string | null | undefined) =>
    !!value || t('common.validation.required'),
};
</script>

<template>
  <v-dialog
    data-test-id="skills-add-modal"
    :model-value="modelValue"
    max-width="500"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="p-4">
      <v-card-title data-test-id="modal-title" class="px-4 text-h5">{{
        editData ? t('common.actions.update') : t('common.actions.add')
      }}</v-card-title>

      <v-form
        ref="formRef"
        data-test-id="skills-form"
        validate-on="submit lazy"
        @submit.prevent="submit"
      >
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.name"
                data-test-id="input-name"
                :label="t('skills.name')"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                required
              ></v-text-field>

              <v-select
                v-model="form.categoryId"
                data-test-id="input-category"
                :items="categories"
                item-title="name"
                item-value="id"
                :label="t('skills.category')"
                variant="outlined"
                density="compact"
                clearable
              ></v-select>
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
