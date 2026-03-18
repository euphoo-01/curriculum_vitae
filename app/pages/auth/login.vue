<script setup lang="ts">
const passwordVisible = ref<boolean>(false);
const email = ref('');
const password = ref('');
const errorMsg = ref('');
const loading = ref(false);

const router = useRouter();
const auth = useAuth();

const onSubmit = async () => {
  if (!email.value || !password.value) return;
  loading.value = true;
  errorMsg.value = '';

  try {
    await auth.login({ email: email.value, password: password.value });
    router.push('/users');
  } catch (err: unknown) {
    if (err instanceof Error) {
      errorMsg.value = err.message;
    } else {
      errorMsg.value = 'Ошибка авторизации';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-wrapper">
    <AuthTabs />

    <div class="auth-content">
      <div class="auth-box">
        <v-form @submit.prevent="onSubmit">
          <div class="text-center mb-6">
            <h1 align="center">{{ $t('loginScreenTitle') }}</h1>
            <p align="center">
              {{ $t('loginScreenGreeting') }}
            </p>
          </div>
          <v-alert
            v-if="errorMsg"
            type="error"
            variant="tonal"
            class="mb-4"
            density="compact"
          >
            {{ errorMsg }}
          </v-alert>
          <v-text-field
            v-model="email"
            variant="outlined"
            :label="$t('email')"
            density="compact"
            rounded="0"
            width="100%"
          ></v-text-field>
          <v-text-field
            v-model="password"
            :append-inner-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
            :type="passwordVisible ? 'text' : 'password'"
            :label="$t('password')"
            rounded="0"
            density="compact"
            variant="outlined"
            @click:append-inner="passwordVisible = !passwordVisible"
          ></v-text-field>
          <v-btn
            :loading="loading"
            type="submit"
            rounded
            variant="flat"
            color="primary"
            size="x-large"
            class="pa-4 mb-4"
            block
            >{{ $t('login') }}</v-btn
          >
          <div class="text-center">
            <v-btn block rounded variant="text">{{
              $t('forgotPassword')
            }}</v-btn>
          </div>
        </v-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 16px;
}

.auth-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.auth-box {
  width: 100%;
  max-width: 450px;
}
</style>
