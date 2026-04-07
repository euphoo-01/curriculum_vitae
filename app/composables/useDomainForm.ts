import { ref, watch, type Ref } from 'vue';
import type { VForm } from 'vuetify/components';

export interface UseDomainFormOptions<
  TFormData,
  TEditData,
  TSubmitData = TFormData,
> {
  initialData: () => TFormData;
  mapEditData: (editData: TEditData) => TFormData;
  prepareSubmitData?: (
    formData: TFormData,
    editData?: TEditData | null
  ) => TSubmitData | undefined;
}

export function useDomainForm<
  TFormData,
  TEditData,
  TSubmitData = TFormData & { id?: string },
>(
  props: { modelValue: boolean; editData?: TEditData | null },
  emit: {
    (e: 'update:modelValue', value: boolean): void;
    (e: 'submit', payload: TSubmitData): void;
  },
  options: UseDomainFormOptions<TFormData, TEditData, TSubmitData>
) {
  const formRef = ref<VForm | null>(null);
  const form = ref(options.initialData()) as Ref<TFormData>;

  watch(
    [() => props.modelValue, () => props.editData],
    ([newModelValue, newEditData]) => {
      if (newModelValue && newEditData) {
        form.value = options.mapEditData(newEditData as TEditData);
      } else if (!newModelValue || (newModelValue && !newEditData)) {
        form.value = options.initialData();
        formRef.value?.resetValidation();
      }
    },
    { immediate: true }
  );

  const close = () => emit('update:modelValue', false);

  const submit = async () => {
    if (!formRef.value) return;
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    let payload: unknown;
    if (options.prepareSubmitData) {
      payload = options.prepareSubmitData(form.value, props.editData);
      if (payload === undefined) return;
    } else {
      const id =
        props.editData &&
        typeof props.editData === 'object' &&
        'id' in props.editData
          ? String((props.editData as { id: unknown }).id)
          : undefined;
      payload = { id, ...form.value };
    }

    emit('submit', payload as TSubmitData);
  };

  return {
    formRef,
    form,
    close,
    submit,
  };
}
