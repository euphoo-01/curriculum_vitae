<template>
  <v-row class="mb-6 justify-center items-center" style="gap: 6rem">
    <v-col cols="auto">
      <div
        class="relative transition-transform duration-200 hover:scale-[1.05]"
        :class="{ 'cursor-pointer': canEdit }"
        @click="canEdit && !avatarUrl && triggerFileInput()"
        @dragover.prevent="canEdit && onDragOver($event)"
        @dragleave.prevent="canEdit && (isDragging = false)"
        @drop.prevent="canEdit && onDrop($event)"
      >
        <v-avatar
          size="180"
          :color="avatarUrl ? 'transparent' : 'secondary'"
          class="border-2 border-dashed transition-all duration-300 group"
          :class="[
            isDragging ? 'border-primary opacity-80' : 'border-transparent',
          ]"
        >
          <v-img v-if="avatarUrl" :src="avatarUrl">
            <template #placeholder>
              <div
                class="d-flex content-center items-center justify-center h-full"
              >
                <v-progress-circular
                  indeterminate
                  color="primary"
                ></v-progress-circular>
              </div>
            </template>
          </v-img>
          <span v-else class="text-h4 text-on-secondary font-bold">{{
            initials
          }}</span>

          <div
            v-if="canEdit && avatarUrl && !isUploading"
            class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 z-10 cursor-pointer"
            @click.prevent.stop="emit('delete')"
          >
            <div
              class="text-white hover:text-primary transition-colors duration-200"
            >
              <v-icon icon="mdi-close" size="x-large" color="inherit"></v-icon>
            </div>
          </div>

          <v-overlay
            v-if="isUploading"
            contained
            persistent
            model-value
            class="align-center d-flex justify-center"
          >
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </v-overlay>
        </v-avatar>
        <input
          ref="fileInput"
          type="file"
          accept="image/png, image/jpeg, image/gif"
          class="hidden"
          @change="onFileSelected"
        />
      </div>
    </v-col>

    <v-col v-if="canEdit" cols="auto">
      <div
        class="cursor-pointer d-flex flex-column justify-center align-center p-4 rounded-2xl transition-colors"
        :style="
          isDragging
            ? 'background-color: rgb(var(--v-theme-primary), 0.05); border: 1px dashed rgb(var(--v-theme-primary), 0.5)'
            : ''
        "
        @click="triggerFileInput"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
      >
        <div
          class="d-flex flex-column align-center text-center justify-center w-fit"
        >
          <p class="text-lg font-bold text-center">
            <v-icon icon="mdi-upload" color="text" size="x-large"></v-icon>
            {{ $t('profile.avatar.uploadTitle') }}
          </p>
          <p class="text-md text-center">
            {{ $t('profile.avatar.uploadDesc') }}
          </p>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useFileUpload } from '~/composables/useFileUpload';

defineProps<{
  avatarUrl?: string | null;
  initials?: string;
  canEdit?: boolean;
}>();

const emit = defineEmits<{
  (e: 'upload', file: File, base64: string): void;
  (e: 'error', error: string): void;
  (e: 'delete'): void;
}>();

const {
  fileInput,
  isUploading,
  isDragging,
  triggerFileInput,
  onFileSelected,
  onDrop,
} = useFileUpload({
  onUpload: async (file, base64) => {
    emit('upload', file, base64);
  },
  onError: (err) => emit('error', err),
});

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = true;
};
</script>

<style scoped>
.hidden {
  display: none;
}
</style>
