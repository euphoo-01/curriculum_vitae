<template>
  <v-layout class="bg-background h-screen">
    <LayoutSidebar />

    <v-main class="bg-background flex flex-col w-full h-screen">
      <slot />
    </v-main>
  </v-layout>
</template>
