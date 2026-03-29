<script setup lang="ts">
interface Props {
  modelValue: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  title: 'Подтвердите действие',
  message: 'Вы уверены, что хотите выполнить это действие?',
  confirmText: 'Подтвердить',
  cancelText: 'Отмена',
  confirmColor: 'error',
  loading: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm' | 'cancel'): void;
}>();

const close = () => {
  emit('update:modelValue', false);
  emit('cancel');
};

const confirm = () => {
  emit('confirm');
  emit('update:modelValue', false);
};
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="450"
    @update:model-value="emit('update:modelValue', $event)"
    @keydown.esc="close"
  >
    <v-card class="p-4">
      <v-card-title class="text-h5">
        {{ title }}
      </v-card-title>

      <v-card-text v-if="message">
        {{ message }}
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn
          variant="text"
          rounded
          size="x-large"
          class="px-8"
          :disabled="loading"
          @click="close"
        >
          {{ cancelText }}
        </v-btn>

        <v-btn
          color="primary"
          :loading="loading"
          variant="flat"
          rounded
          class="px-8"
          size="x-large"
          @click="confirm"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
