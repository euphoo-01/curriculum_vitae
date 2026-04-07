<script setup lang="ts">
import type { VForm } from 'vuetify/components';
definePageMeta({ layout: 'auth' });

const { t } = useI18n();
useSeoMeta({
  title: t('seo.register.title'),
  ogTitle: t('seo.register.title'),
  description: t('seo.register.description'),
  ogDescription: t('seo.register.description'),
});
const router = useRouter();
const auth = useAuthStore();

const passwordVisible = ref<boolean>(false);
const email = ref('');
const password = ref('');
const errorMsg = ref('');
const loading = ref(false);
const form = ref<VForm | null>(null);

const rules = {
  required: (value: string) => !!value || t('common.validation.required'),
  email: (value: string) => {
    const pattern =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(value) || t('common.validation.email');
  },
};

const onSubmit = async () => {
  if (!form.value) return;
  const { valid } = await form.value.validate();
  if (!valid) return;

  loading.value = true;
  errorMsg.value = '';
  try {
    await auth.register({ email: email.value, password: password.value });
    router.push('/users');
  } catch (err: unknown) {
    if (err instanceof Error) {
      errorMsg.value = err.message;
    } else {
      errorMsg.value = t('auth.register.error');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    class="fixed top-0 left-0 w-screen h-screen flex items-center justify-center overflow-y-auto p-4"
  >
    <AuthTabs />

    <div class="flex items-center justify-center w-full">
      <div class="w-full max-w-[560px] flex items-center justify-center">
        <v-form
          ref="form"
          data-test-id="register-form"
          class="w-full"
          validate-on="submit lazy"
          @submit.prevent="onSubmit"
        >
          <div class="text-center mb-6">
            <h1 align="center">{{ $t('auth.register.title') }}</h1>
            <p align="center" class="mb-8">
              {{ $t('auth.register.greeting') }}
            </p>
          </div>
          <v-alert
            v-if="errorMsg"
            type="error"
            variant="tonal"
            class="mb-4"
            density="compact"
            data-test-id="error-alert"
          >
            {{ errorMsg }}
          </v-alert>
          <v-text-field
            v-model="email"
            variant="outlined"
            :label="$t('common.fields.email')"
            density="compact"
            rounded="0"
            width="100%"
            name="email"
            autocomplete="email"
            class="mb-2"
            :rules="[rules.required, rules.email]"
            data-test-id="email-input"
          ></v-text-field>
          <v-text-field
            v-model="password"
            :append-inner-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
            :type="passwordVisible ? 'text' : 'password'"
            :label="$t('common.fields.password')"
            rounded="0"
            density="compact"
            variant="outlined"
            name="password"
            autocomplete="new-password"
            :rules="[rules.required]"
            data-test-id="password-input"
            class="mb-2"
            @click:append-inner="passwordVisible = !passwordVisible"
          ></v-text-field>
          <div class="flex justify-center mt-6 mb-4">
            <v-btn
              :loading="loading"
              type="submit"
              rounded
              variant="flat"
              color="primary"
              size="x-large"
              class="pa-4 min-w-[15rem]"
              data-test-id="submit-button"
              >{{ $t('auth.register.submit') }}</v-btn
            >
          </div>
          <div class="text-center">
            <v-btn
              rounded
              variant="text"
              size="small"
              @click="router.push('/auth/login')"
            >
              {{ $t('auth.register.haveAccount') }}
            </v-btn>
          </div>
        </v-form>
      </div>
    </div>
  </div>
</template>
