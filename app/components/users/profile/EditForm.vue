<template>
  <v-form v-model="isValid" @submit.prevent="handleSubmit">
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="formData.first_name"
          :label="$t('profile.first_name')"
          :readonly="!canEdit"
          variant="outlined"
          density="comfortable"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="formData.last_name"
          :label="$t('profile.last_name')"
          :readonly="!canEdit"
          variant="outlined"
          density="comfortable"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6">
        <v-select
          v-model="formData.departmentId"
          :items="departments"
          item-title="name"
          item-value="id"
          :label="$t('profile.department')"
          :readonly="!canEdit"
          variant="outlined"
          density="comfortable"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="6">
        <v-select
          v-model="formData.positionId"
          :items="positions"
          item-title="name"
          item-value="id"
          :label="$t('profile.position')"
          :readonly="!canEdit"
          variant="outlined"
          density="comfortable"
        ></v-select>
      </v-col>
    </v-row>

    <v-row v-if="canEdit" justify="end">
      <v-col v-if="showLogout" cols="auto" class="pt-6">
        <v-btn
          color="error"
          variant="outlined"
          class="px-8 rounded-full"
          size="x-large"
          @click="$emit('logout')"
        >
          {{ $t('common.logout') }}
        </v-btn>
      </v-col>
      <v-col cols="auto" class="pt-6">
        <v-btn
          type="submit"
          color="primary"
          variant="flat"
          :disabled="!isChanged || !isValid"
          :loading="updating"
          class="px-8 rounded-full"
          size="x-large"
        >
          {{ $t('common.update') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import type { Department, Position } from '~~/graphql/generated/graphql';

export interface ProfileFormData {
  first_name: string;
  last_name: string;
  departmentId: string | null;
  positionId: string | null;
}

const props = defineProps<{
  initialData: ProfileFormData;
  departments: Department[];
  positions: Position[];
  canEdit: boolean;
  showLogout: boolean;
  updating: boolean;
}>();

const emit = defineEmits<{
  (e: 'update', data: ProfileFormData): void;
  (e: 'logout'): void;
}>();

const isValid = ref(true);

const formData = reactive<ProfileFormData>({
  first_name: '',
  last_name: '',
  departmentId: null,
  positionId: null,
});

watch(
  () => props.initialData,
  (newData) => {
    Object.assign(formData, newData);
  },
  { immediate: true, deep: true }
);

const isChanged = computed(() => {
  return (
    formData.first_name !== props.initialData.first_name ||
    formData.last_name !== props.initialData.last_name ||
    formData.departmentId !== props.initialData.departmentId ||
    formData.positionId !== props.initialData.positionId
  );
});

const handleSubmit = () => {
  if (isValid.value && isChanged.value) {
    emit('update', { ...formData });
  }
};
</script>
