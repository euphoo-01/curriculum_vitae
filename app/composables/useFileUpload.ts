import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

export interface UseFileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  onUpload: (file: File, base64: string) => Promise<void>;
  onError?: (error: string) => void;
}

export const useFileUpload = (options: UseFileUploadOptions) => {
  const { t } = useI18n();
  const fileInput = ref<HTMLInputElement | null>(null);
  const isUploading = ref(false);
  const isDragging = ref(false);

  const maxSize = options.maxSize || 0.5 * 1024 * 1024;
  const allowedTypes = options.allowedTypes || [
    'image/png',
    'image/jpeg',
    'image/gif',
  ];

  const triggerFileInput = () => {
    if (!isUploading.value) {
      fileInput.value?.click();
    }
  };

  const processFile = async (file: File) => {
    if (!allowedTypes.includes(file.type)) {
      options.onError?.(t('profile.upload_error_type'));
      return;
    }

    if (file.size > maxSize) {
      options.onError?.(t('profile.upload_error_size'));
      return;
    }

    isUploading.value = true;
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      await options.onUpload(file, base64);
    } catch (e) {
      options.onError?.(e instanceof Error ? e.message : t('Upload failed'));
    } finally {
      isUploading.value = false;
    }
  };

  const onFileSelected = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files?.[0]) {
      processFile(target.files[0]);
    }
  };

  const onDrop = (event: DragEvent) => {
    isDragging.value = false;
    if (isUploading.value) return;

    const files = event.dataTransfer?.files;
    if (files?.[0]) {
      processFile(files[0]);
    }
  };

  return {
    fileInput,
    isUploading,
    isDragging,
    triggerFileInput,
    onFileSelected,
    onDrop,
  };
};
