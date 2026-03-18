<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <div class="auth-tabs">
    <v-tabs :model-value="route.path" align-tabs="center" color="primary">
      <v-tab value="/auth/login" to="/auth/login">
        {{ $t('login') }}
      </v-tab>
      <v-tab value="/auth/register" to="/auth/register">
        {{ $t('create') }}
      </v-tab>
    </v-tabs>
  </div>
</template>

<style scoped>
.auth-tabs {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding-top: 16px;
}
</style>
