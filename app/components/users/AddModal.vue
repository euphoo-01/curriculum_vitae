<script setup lang="ts">
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

const { formRef, form, close, submit } = useDomainForm<
  CreateUserInput,
  unknown
>(props, emit, {
  initialData: () => ({
    auth: { email: '', password: '' },
    cvsIds: [],
    departmentId: '',
    positionId: '',
    profile: { first_name: '', last_name: '' },
    role: UserRole.Employee,
  }),
  mapEditData: () => ({
    auth: { email: '', password: '' },
    cvsIds: [],
    departmentId: '',
    positionId: '',
    profile: { first_name: '', last_name: '' },
    role: UserRole.Employee,
  }),
  prepareSubmitData: (formData) => ({
    ...formData,
    departmentId: formData.departmentId || undefined,
    positionId: formData.positionId || undefined,
    cvsIds: formData.cvsIds.filter(Boolean),
  }),
});

const rules = {
  required: (value: string | null | undefined) =>
    !!value || t('common.validation.required'),
  email: (value: string) => {
    const pattern =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(value) || t('common.validation.email');
  },
};
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="p-4">
      <v-card-title class="px-4 text-h5">{{
        t('profile.create')
      }}</v-card-title>

      <v-form ref="formRef" validate-on="submit lazy" @submit.prevent="submit">
        <v-container>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.auth.email"
                :label="t('common.fields.email')"
                variant="outlined"
                density="compact"
                type="email"
                :rules="[rules.required, rules.email]"
                required
              ></v-text-field>

              <v-text-field
                v-model="form.profile.first_name"
                :label="t('common.fields.firstName')"
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
                :label="t('common.fields.department')"
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
                :label="t('common.fields.password')"
                variant="outlined"
                density="compact"
                type="password"
                :rules="[rules.required]"
                required
              ></v-text-field>

              <v-text-field
                v-model="form.profile.last_name"
                :label="t('common.fields.lastName')"
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
                :label="t('common.fields.position')"
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
            {{ t('common.actions.create') }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
