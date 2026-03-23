<script setup lang="ts"></script>

<template>
  <v-layout class="bg-background">
    <LayoutSidebar />

    <v-main class="bg-background d-flex flex-column">
      <slot />
    </v-main>
  </v-layout>
</template>
