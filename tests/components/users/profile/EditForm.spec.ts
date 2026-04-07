import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import EditForm from '../../../../app/components/users/profile/EditForm.vue';

describe('EditForm Component', () => {
  it('renders correct data and handles submit', async () => {
    const initialData = {
      first_name: 'John',
      last_name: 'Doe',
      departmentId: '1',
      positionId: '2',
    };

    const wrapper = await mountSuspended(EditForm, {
      props: {
        initialData,
        departments: [{ id: '1', name: 'IT' }],
        positions: [{ id: '2', name: 'Dev' }],
        canEdit: true,
        showLogout: true,
        updating: false,
      },
      global: {
        mocks: {
          $t: (msg: string) => msg,
        },
        stubs: {
          VForm: {
            template:
              '<form @submit.prevent="$emit(\'submit\', $event)"><slot /></form>',
            props: ['modelValue'],
          },
          VRow: { template: '<div><slot /></div>' },
          VCol: { template: '<div><slot /></div>' },
          VTextField: {
            template:
              '<input class="v-text-field" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'label', 'readonly'],
          },
          VSelect: {
            template:
              '<select class="v-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"></select>',
            props: ['modelValue', 'items', 'label', 'readonly'],
          },
          VBtn: {
            template: '<button class="v-btn"><slot /></button>',
            props: ['disabled', 'loading', 'color'],
          },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);

    const inputs = wrapper.findAll('.v-text-field');
    expect(inputs.length).toBe(2);
    expect(inputs[0].attributes('value')).toBe('John');

    await inputs[0].setValue('Jane');

    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('update')).toBeTruthy();
    expect(wrapper.emitted('update')![0][0]).toMatchObject({
      first_name: 'Jane',
      last_name: 'Doe',
      departmentId: '1',
      positionId: '2',
    });
  });
});
