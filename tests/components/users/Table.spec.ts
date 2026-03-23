import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import UsersTable from '../../../app/components/users/Table.vue';
import {
  UserRole,
  type User,
  type Profile,
} from '../../../graphql/generated/graphql';

const mockItems: User[] = [
  {
    id: '1',
    email: 'test1@example.com',
    role: UserRole.Employee,
    profile: {
      first_name: 'Vasya',
      last_name: 'Pupkin',
      full_name: 'Vasya Pupkin',
    } as Profile,
    department_name: 'IT',
    position_name: 'Developer',
    created_at: '2026-03-01',
    is_verified: true,
  },
  {
    id: '2',
    email: 'test2@example.com',
    role: UserRole.Admin,
    profile: {
      first_name: 'Ivan',
      last_name: 'Ivanov',
      full_name: 'Ivan Ivanov',
    } as Profile,
    department_name: 'HR',
    position_name: 'Manager',
    created_at: '2026-03-01',
    is_verified: true,
  },
];

describe('UsersTable Component', () => {
  it('renders correctly with empty items', async () => {
    const wrapper = await mountSuspended(UsersTable, {
      props: {
        items: [],
      },
    });

    expect(wrapper.html()).toContain('No data available');
  });

  it('renders user data correctly', async () => {
    const wrapper = await mountSuspended(UsersTable, {
      props: {
        items: mockItems,
      },
    });

    const html = wrapper.html();

    expect(html).toContain('Vasya');
    expect(html).toContain('Pupkin');
    expect(html).toContain('test1@example.com');
    expect(html).toContain('IT');
    expect(html).toContain('Developer');

    expect(html).toContain('Ivan');
    expect(html).toContain('Ivanov');
    expect(html).toContain('test2@example.com');
    expect(html).toContain('HR');
    expect(html).toContain('Manager');
  });

  it('displays loading state', async () => {
    const wrapper = await mountSuspended(UsersTable, {
      props: {
        items: [],
        loading: true,
      },
    });

    expect(wrapper.find('.v-data-table-progress').exists()).toBe(true);
  });
});
