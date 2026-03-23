<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <div class="absolute top-0 left-0 w-full pt-4">
    <v-tabs :model-value="route.path" align-tabs="center" color="primary">
      <v-tab value="/auth/login" to="/auth/login" data-test-id="login-tab">
        {{ $t('login') }}
      </v-tab>
      <v-tab
        value="/auth/register"
        to="/auth/register"
        data-test-id="register-tab"
      >
        {{ $t('create') }}
      </v-tab>
    </v-tabs>
  </div>
</template>
