<script setup lang="ts"></script>

<template>
  <v-layout class="bg-background">
    <LayoutSidebar />

    <v-main class="bg-background w-full h-screen">
      <slot />
    </v-main>
  </v-layout>
</template>
