<script setup lang="ts">
const passwordVisible = ref<boolean>(false);
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-tabs">
      <v-tabs align-tabs="center" color="primary">
        <v-tab to="/auth/login" exact>
          {{ $t('login') }}
        </v-tab>
        <v-tab to="/auth/register" exact>
          {{ $t('create') }}
        </v-tab>
      </v-tabs>
    </div>

    <div class="auth-content">
      <div class="auth-box">
        <v-form>
          <div class="text-center mb-6">
            <h1 align="center">{{ $t('regScreenTitle') }}</h1>
            <p align="center">
              {{ $t('regScreenGreeting') }}
            </p>
          </div>
          <v-text-field
            variant="outlined"
            :label="$t('email')"
            density="compact"
            rounded="0"
            width="100%"
          ></v-text-field>
          <v-text-field
            :append-inner-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
            :type="passwordVisible ? 'text' : 'password'"
            :label="$t('password')"
            rounded="0"
            density="compact"
            variant="outlined"
            @click:append-inner="passwordVisible = !passwordVisible"
          ></v-text-field>
          <v-btn
            rounded
            variant="flat"
            color="primary"
            size="x-large"
            class="pa-4 mb-4"
            block
            >{{ $t('createAccount') }}</v-btn
          >
          <div class="text-center">
            <v-btn block rounded variant="text" to="/auth/login">{{
              $t('haveAccount')
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

.auth-tabs {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding-top: 16px;
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
