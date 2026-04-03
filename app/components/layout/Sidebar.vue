<script setup lang="ts">
import { ref } from 'vue';

const authStore = useAuthStore();
const isRail = ref(false);

const menuItems = [
  {
    to: '/users',
    icon: 'mdi-account-multiple',
    titleKey: 'sidebarUsers',
    value: 'users',
  },
  {
    to: '/projects',
    icon: 'mdi-briefcase-outline',
    titleKey: 'sidebarProjects',
    value: 'projects',
  },
  {
    to: '/cvs',
    icon: 'mdi-file-account-outline',
    titleKey: 'sidebarCVs',
    value: 'cvs',
  },
  {
    divider: true,
    value: 'divider-1',
  },
  {
    to: '/departments',
    icon: 'mdi-domain',
    titleKey: 'sidebarDepartments',
    value: 'departments',
  },
  {
    to: '/positions',
    icon: 'mdi-badge-account-horizontal-outline',
    titleKey: 'sidebarPositions',
    value: 'positions',
  },
  {
    to: '/skills',
    icon: 'mdi-trending-up',
    titleKey: 'sidebarSkills',
    value: 'skills',
  },
  {
    to: '/languages',
    icon: 'mdi-translate',
    titleKey: 'sidebarLanguages',
    value: 'languages',
  },
];
</script>

<template>
  <v-navigation-drawer
    permanent
    :width="250"
    :rail="isRail"
    class="border-0 bg-surface flex flex-column pt-5 h-screen"
  >
    <v-list
      class="pt-8 transition-all duration-200"
      :class="isRail ? 'px-2' : 'pe-4 ps-0'"
      nav
      density="comfortable"
    >
      <template v-for="item in menuItems" :key="item.value">
        <v-divider v-if="item.divider" class="my-2"></v-divider>
        <v-list-item
          v-else
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.titleKey ? $t(item.titleKey) : undefined"
          :value="item.value"
          variant="text"
          density="default"
          active-class="bg-secondary font-weight-bold"
          :class="[
            'mb-2 transition-all duration-200',
            isRail ? 'rounded-full' : 'rounded-r-full rounded-l-0',
          ]"
        ></v-list-item>
      </template>
    </v-list>

    <template #append>
      <v-list
        nav
        density="comfortable"
        class="bg-transparent pa-2 transition-all duration-200"
      >
        <v-list-item
          variant="text"
          min-height="64"
          :class="[
            isRail ? 'px-0' : 'px-4',
            'text-none rounded-lg transition-all duration-200',
          ]"
          :to="`/users/${authStore.userId}/profile`"
        >
          <template #prepend>
            <v-avatar color="primary" size="40">
              <v-img
                v-if="authStore.user?.profile?.avatar"
                :src="authStore.user?.profile?.avatar"
                alt="Avatar"
              ></v-img>
              <span v-else class="text-h6 text-on-primary">{{
                authStore.user?.email?.charAt(0).toUpperCase()
              }}</span>
            </v-avatar>
          </template>
          <v-list-item-title
            v-if="!isRail"
            class="text-body-1 font-weight-medium"
          >
            {{
              authStore.user?.profile?.first_name ||
              authStore.user?.profile?.last_name
                ? `${authStore.user?.profile?.first_name || ''} ${authStore.user?.profile?.last_name || ''}`.trim()
                : 'User'
            }}
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <div
        class="px-2 pb-3 mt-1 d-flex"
        :class="isRail ? 'justify-center' : 'justify-end'"
      >
        <v-btn
          variant="text"
          icon
          size="small"
          class="transition-all duration-200"
          @click="isRail = !isRail"
        >
          <v-icon size="24">{{
            isRail ? 'mdi-chevron-right' : 'mdi-chevron-left'
          }}</v-icon>
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>
