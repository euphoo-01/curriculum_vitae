<script setup lang="ts">
import type { VForm } from 'vuetify/components';
import type {
  GetDepartmentsQuery,
  GetPositionsQuery,
  CreateUserInput,
} from '~~/graphql/generated/graphql';
import { UserRole } from '~~/graphql/generated/graphql';

interface Props {
  modelValue: boolean;
  loading?: boolean;
  departments: GetDepartmentsQuery['departments'];
  positions: GetPositionsQuery['positions'];
  roles: UserRole[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', formData: CreateUserInput): void;
}>();

const { t } = useI18n();

const formRef = ref<VForm | null>(null);
const form = ref<CreateUserInput>({
  auth: { email: '', password: '' },
  cvsIds: [],
  departmentId: '',
  positionId: '',
  profile: { first_name: '', last_name: '' },
  role: UserRole.Employee,
});

const rules = {
  required: (value: string | null | undefined) => !!value || t('fieldRequired'),
  email: (value: string) => {
    const pattern =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(value) || t('invalidEmail');
  },
};

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      form.value = {
        auth: { email: '', password: '' },
        cvsIds: [],
        departmentId: '',
        positionId: '',
        profile: { first_name: '', last_name: '' },
        role: UserRole.Employee,
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

  const payload: CreateUserInput = {
    ...form.value,
    departmentId: form.value.departmentId || undefined,
    positionId: form.value.positionId || undefined,
    cvsIds: form.value.cvsIds.filter(Boolean),
  };

  emit('submit', payload);
};
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="pa-4">
      <v-card-title class="px-4 text-h5">{{
        t('profile.create')
      }}</v-card-title>

      <v-form ref="formRef" validate-on="submit lazy" @submit.prevent="submit">
        <v-container>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.auth.email"
                :label="t('email')"
                variant="outlined"
                density="compact"
                type="email"
                :rules="[rules.required, rules.email]"
                required
              ></v-text-field>

              <v-text-field
                v-model="form.profile.first_name"
                :label="t('profile.first_name')"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                required
              ></v-text-field>

              <v-select
                v-model="form.departmentId"
                :items="departments"
                item-title="name"
                item-value="id"
                :label="t('profile.department')"
                variant="outlined"
                density="compact"
                clearable
              ></v-select>

              <v-select
                v-model="form.role"
                :items="roles"
                :label="t('profile.role')"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.auth.password"
                :label="t('password')"
                variant="outlined"
                density="compact"
                type="password"
                :rules="[rules.required]"
                required
              ></v-text-field>

              <v-text-field
                v-model="form.profile.last_name"
                :label="t('profile.last_name')"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                required
              ></v-text-field>

              <v-select
                v-model="form.positionId"
                :items="positions"
                item-title="name"
                item-value="id"
                :label="t('profile.position')"
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
            {{ t('common.create') }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
