<template>
  <v-navigation-drawer
    permanent
    :location="isMobile ? 'bottom' : 'left'"
    :width="isMobile ? undefined : 250"
    :height="isMobile ? 64 : undefined"
    :rail="isMobileRail"
    :class="[
      'border-0 bg-surface flex transition-all duration-200',
      isMobile ? 'w-full overflow-hidden' : 'flex-column pt-5 h-screen',
    ]"
  >
    <v-list
      nav
      density="comfortable"
      :class="[
        'transition-all duration-200',
        isMobile
          ? 'flex flex-row justify-evenly items-center w-full pa-0 h-full overflow-x-auto no-scrollbar px-1 gap-1'
          : 'pt-8',
        isMobileRail && !isMobile ? 'px-2' : 'pe-4 ps-0',
      ]"
    >
      <template v-for="item in menuItems" :key="item.value">
        <v-divider v-if="item.divider && !isMobile" class="my-2"></v-divider>

        <v-list-item
          v-else-if="!item.divider"
          :to="item.to"
          :title="
            item.titleKey && !isMobileRail ? $t(item.titleKey) : undefined
          "
          :value="item.value"
          :active="item.to ? isItemActive(item.to) : false"
          variant="text"
          active-class="bg-secondary font-weight-bold"
          :class="[
            'text-on-background transition-all duration-200',
            isMobile
              ? '!min-w-[40px] !min-h-[40px] !w-[40px] !h-[40px] !p-0 !m-0 flex items-center justify-center shrink-0 mobile-center-item'
              : 'mb-2',
            isMobileRail ? 'rounded-full' : 'rounded-r-full rounded-l-0',
          ]"
          :data-test-id="`sidebar-item-${item.value}`"
        >
          <template v-if="!isMobile" #prepend>
            <v-icon :icon="item.icon" class="m-0"></v-icon>
          </template>
          <template v-if="isMobile">
            <v-icon :icon="item.icon" size="22" class="ma-0"></v-icon>
          </template>
        </v-list-item>
      </template>

      <v-list-item
        v-if="isMobile && authStore?.userId"
        :to="`/users/${authStore.userId}/profile`"
        :class="[
          'transition-all duration-200 mobile-center-item',
          '!min-w-[40px] !min-h-[40px] !w-[40px] !h-[40px] !p-0 !m-0 rounded-full flex items-center justify-center shrink-0',
        ]"
        data-test-id="sidebar-profile-link-mobile"
      >
        <v-avatar color="primary" size="30" class="ma-0">
          <v-img
            v-if="authStore?.user?.profile?.avatar"
            :src="authStore.user.profile.avatar"
          ></v-img>
          <span v-else class="text-caption text-on-primary">
            {{ authStore?.user?.email?.charAt(0).toUpperCase() || 'U' }}
          </span>
        </v-avatar>
      </v-list-item>
    </v-list>

    <template v-if="!isMobile" #append>
      <v-list nav density="comfortable" class="bg-transparent pa-2">
        <v-list-item
          v-if="authStore?.userId"
          variant="text"
          min-height="64"
          :class="[isMobileRail ? 'px-0' : 'px-4', 'text-none rounded-lg']"
          :to="`/users/${authStore.userId}/profile`"
          data-test-id="sidebar-profile-link"
        >
          <template #prepend>
            <v-avatar color="primary" size="40">
              <v-img
                v-if="authStore?.user?.profile?.avatar"
                :src="authStore.user.profile.avatar"
              ></v-img>
              <span v-else class="text-h6 text-on-primary">
                {{ authStore?.user?.email?.charAt(0).toUpperCase() || 'U' }}
              </span>
            </v-avatar>
          </template>
          <v-list-item-title
            v-if="!isMobileRail"
            class="text-body-1 font-weight-medium"
          >
            {{ authStore?.user?.profile?.first_name || 'User' }}
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <div
        class="px-2 pb-3 mt-1 d-flex"
        :class="isMobileRail ? 'justify-center' : 'justify-end'"
      >
        <v-btn variant="text" icon size="small" @click="isRail = !isRail">
          <v-icon size="24">{{
            isMobileRail ? 'mdi-chevron-right' : 'mdi-chevron-left'
          }}</v-icon>
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDisplay } from 'vuetify';

const authStore = useAuthStore();
const route = useRoute();
const { width } = useDisplay();

const isMobile = computed(() => width.value <= 768);
const isRail = ref(false);

const isMobileRail = computed(() => isMobile.value || isRail.value);

const isItemActive = (path: string) => {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
};

const menuItems = [
  {
    to: '/users',
    icon: 'mdi-account-multiple',
    titleKey: 'sidebar.employees',
    value: 'users',
  },
  {
    to: '/projects',
    icon: 'mdi-briefcase-outline',
    titleKey: 'sidebar.projects',
    value: 'projects',
  },
  {
    to: '/cvs',
    icon: 'mdi-file-account-outline',
    titleKey: 'sidebar.cvs',
    value: 'cvs',
  },
  { divider: true, value: 'divider-1' },
  {
    to: '/departments',
    icon: 'mdi-domain',
    titleKey: 'sidebar.departments',
    value: 'departments',
  },
  {
    to: '/positions',
    icon: 'mdi-badge-account-horizontal-outline',
    titleKey: 'sidebar.positions',
    value: 'positions',
  },
  {
    to: '/skills',
    icon: 'mdi-trending-up',
    titleKey: 'sidebar.skills',
    value: 'skills',
  },
  {
    to: '/languages',
    icon: 'mdi-translate',
    titleKey: 'sidebar.languages',
    value: 'languages',
  },
];
</script>

<style scoped>
:deep(.v-list-item__prepend) {
  margin-inline-end: 0 !important;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.mobile-center-item :deep(.v-list-item__content) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
</style>
