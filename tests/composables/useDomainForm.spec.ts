import { describe, it, expect, vi } from 'vitest';
import { useDomainForm } from '../../app/composables/useDomainForm';
import { reactive, nextTick } from 'vue';
import type { VForm } from 'vuetify/components';

describe('useDomainForm', () => {
  const initialData = () => ({ name: '' });
  const mapEditData = (editData: { id: string; name: string }) => ({
    name: editData.name,
  });

  it('initializes form with initialData', () => {
    const props = reactive({ modelValue: false, editData: null });
    const emit = vi.fn();
    const { form } = useDomainForm(props, emit, { initialData, mapEditData });

    expect(form.value).toEqual({ name: '' });
  });

  it('maps editData when modelValue becomes true', async () => {
    const props = reactive({
      modelValue: false,
      editData: { id: '1', name: 'John' },
    });
    const emit = vi.fn();
    const { form } = useDomainForm(props, emit, { initialData, mapEditData });

    props.modelValue = true;
    await nextTick();

    expect(form.value).toEqual({ name: 'John' });
  });

  it('resets to initialData when modelValue becomes false', async () => {
    const props = reactive({
      modelValue: true,
      editData: { id: '1', name: 'John' },
    });
    const emit = vi.fn();
    const { form } = useDomainForm(props, emit, { initialData, mapEditData });

    await nextTick();
    expect(form.value).toEqual({ name: 'John' });

    props.modelValue = false;
    await nextTick();

    expect(form.value).toEqual({ name: '' });
  });

  it('emits update:modelValue with false on close', () => {
    const props = reactive({ modelValue: true, editData: null });
    const emit = vi.fn();
    const { close } = useDomainForm(props, emit, { initialData, mapEditData });

    close();

    expect(emit).toHaveBeenCalledWith('update:modelValue', false);
  });

  it('submits form with custom prepareSubmitData', async () => {
    const props = reactive({ modelValue: true, editData: null });
    const emit = vi.fn();

    const prepareSubmitData = vi
      .fn()
      .mockReturnValue({ customId: 'abc', customName: 'Jane' });

    const { submit, form, formRef } = useDomainForm(props, emit, {
      initialData,
      mapEditData,
      prepareSubmitData,
    });

    formRef.value = {
      validate: vi.fn().mockResolvedValue({ valid: true }),
    } as unknown as VForm;
    form.value.name = 'Jane';

    await submit();

    expect(prepareSubmitData).toHaveBeenCalledWith({ name: 'Jane' }, null);
    expect(emit).toHaveBeenCalledWith('submit', {
      customId: 'abc',
      customName: 'Jane',
    });
  });

  it('does not emit submit when prepareSubmitData returns undefined', async () => {
    const props = reactive({ modelValue: true, editData: null });
    const emit = vi.fn();

    const prepareSubmitData = vi.fn().mockReturnValue(undefined);

    const { submit, formRef } = useDomainForm(props, emit, {
      initialData,
      mapEditData,
      prepareSubmitData,
    });

    formRef.value = {
      validate: vi.fn().mockResolvedValue({ valid: true }),
    } as unknown as VForm;

    await submit();

    expect(prepareSubmitData).toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalledWith('submit', expect.anything());
  });

  it('does not submit when invalid', async () => {
    const props = reactive({ modelValue: true, editData: null });
    const emit = vi.fn();
    const { submit, formRef } = useDomainForm(props, emit, {
      initialData,
      mapEditData,
    });

    formRef.value = {
      validate: vi.fn().mockResolvedValue({ valid: false }),
    } as unknown as VForm;

    await submit();

    expect(emit).not.toHaveBeenCalledWith('submit', expect.anything());
  });

  it('does not submit when formRef is null', async () => {
    const props = reactive({ modelValue: true, editData: null });
    const emit = vi.fn();
    const { submit, formRef } = useDomainForm(props, emit, {
      initialData,
      mapEditData,
    });

    formRef.value = null;

    await submit();

    expect(emit).not.toHaveBeenCalledWith('submit', expect.anything());
  });

  it('extracts ID from editData if prepareSubmitData is not provided', async () => {
    const props = reactive({
      modelValue: true,
      editData: { id: 'user-123', name: 'Bob' },
    });
    const emit = vi.fn();
    const { submit, formRef, form } = useDomainForm(props, emit, {
      initialData,
      mapEditData,
    });

    formRef.value = {
      validate: vi.fn().mockResolvedValue({ valid: true }),
    } as unknown as VForm;
    form.value.name = 'Bob Updated';

    await submit();

    expect(emit).toHaveBeenCalledWith('submit', {
      id: 'user-123',
      name: 'Bob Updated',
    });
  });

  it('sets ID to undefined if editData is provided but has no ID', async () => {
    const props = reactive({
      modelValue: true,
      editData: { someOtherKey: '123' },
    });
    const emit = vi.fn();
    const { submit, formRef, form } = useDomainForm(props, emit, {
      initialData,
      mapEditData: () => ({ name: '' }),
    });

    formRef.value = {
      validate: vi.fn().mockResolvedValue({ valid: true }),
    } as unknown as VForm;
    form.value.name = 'No ID Obj';

    await submit();

    expect(emit).toHaveBeenCalledWith('submit', {
      id: undefined,
      name: 'No ID Obj',
    });
  });

  it('sets ID to undefined if editData is not an object', async () => {
    const props = reactive({ modelValue: true, editData: 'just-a-string' });
    const emit = vi.fn();
    const { submit, formRef, form } = useDomainForm(props, emit, {
      initialData,
      mapEditData: () => ({ name: '' }),
    });

    formRef.value = {
      validate: vi.fn().mockResolvedValue({ valid: true }),
    } as unknown as VForm;
    form.value.name = 'Primitive Data';

    await submit();

    expect(emit).toHaveBeenCalledWith('submit', {
      id: undefined,
      name: 'Primitive Data',
    });
  });
});
