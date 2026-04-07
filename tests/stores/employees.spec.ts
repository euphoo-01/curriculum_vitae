import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEmployeesStore } from '../../app/stores/employees';
import { useNuxtApp } from '#imports';

const mutateMock = vi.fn();
const queryMock = vi.fn();

describe('Employees Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    const nuxtApp = useNuxtApp() as ReturnType<typeof useNuxtApp> & {
      $apollo?: { defaultClient: ApolloClientMock };
    };

    const apolloMock: ApolloClientMock = {
      mutate: mutateMock,
      query: queryMock,
    };

    if (!nuxtApp.$apollo) {
      nuxtApp.provide('apollo', {
        defaultClient: apolloMock,
      });
    } else {
      nuxtApp.$apollo.defaultClient = apolloMock;
    }
  });

  it('fetches users successfully', async () => {
    const store = useEmployeesStore();
    const mockUsers = [{ id: '1', email: 'test@example.com' }];
    queryMock.mockResolvedValueOnce({ data: { users: mockUsers } });

    await store.fetchUsers();

    expect(queryMock).toHaveBeenCalled();
    expect(store.users).toEqual(mockUsers);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('handles fetch users error', async () => {
    const store = useEmployeesStore();
    queryMock.mockRejectedValueOnce(new Error('Fetch failed'));

    await store.fetchUsers();

    expect(store.error).toBe('Fetch failed');
    expect(store.loading).toBe(false);
  });

  it('deletes a user', async () => {
    const store = useEmployeesStore();
    mutateMock.mockResolvedValueOnce({});
    queryMock.mockResolvedValueOnce({ data: { users: [] } });

    await store.deleteUser('1');

    expect(mutateMock).toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalled();
  });

  it('handles delete user error', async () => {
    const store = useEmployeesStore();
    mutateMock.mockRejectedValueOnce(new Error('Delete failed'));

    await store.deleteUser('1');

    expect(store.error).toBe('Delete failed');
  });

  it('creates a user', async () => {
    const store = useEmployeesStore();
    mutateMock.mockResolvedValueOnce({});
    queryMock.mockResolvedValueOnce({ data: { users: [] } });

    await store.createUser({
      email: 'new@example.com',
      password: 'password',
      role: 'employee',
    });

    expect(mutateMock).toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalled();
  });

  it('handles create user error', async () => {
    const store = useEmployeesStore();
    mutateMock.mockRejectedValueOnce(new Error('Create failed'));

    await store.createUser({
      email: 'new@example.com',
      password: 'password',
      role: 'employee',
    });

    expect(store.error).toBe('Create failed');
  });

  it('fetches user profile successfully', async () => {
    const store = useEmployeesStore();
    const mockUser = { id: '1', email: 'test@example.com' };
    queryMock.mockResolvedValueOnce({ data: { user: mockUser } });

    await store.fetchUser('1');

    expect(queryMock).toHaveBeenCalled();
    expect(store.user).toEqual(mockUser);
    expect(store.loading).toBe(false);
  });

  it('handles fetch user profile error', async () => {
    const store = useEmployeesStore();
    queryMock.mockRejectedValueOnce(new Error('Fetch failed'));

    await store.fetchUser('1');

    expect(store.error).toBe('Fetch failed');
    expect(store.loading).toBe(false);
  });

  it('updates a user', async () => {
    const store = useEmployeesStore();
    const mockUpdatedUser = { id: '1', departmentId: '2' };
    store.user = { id: '1', email: 'test@example.com' } as unknown as Record<
      string,
      unknown
    >;
    mutateMock.mockResolvedValueOnce({ data: { updateUser: mockUpdatedUser } });

    const result = await store.updateUser({ id: '1', departmentId: '2' });

    expect(mutateMock).toHaveBeenCalled();
    expect(result).toEqual(mockUpdatedUser);
    expect(store.user?.departmentId).toBe('2');
  });

  it('handles update user error', async () => {
    const store = useEmployeesStore();
    mutateMock.mockRejectedValueOnce(new Error('Update failed'));

    await expect(store.updateUser({ id: '1' })).rejects.toThrow(
      'Update failed'
    );
  });

  it('updates a profile', async () => {
    const store = useEmployeesStore();
    const mockUpdatedProfile = { firstName: 'John' };
    store.user = {
      id: '1',
      profile: { firstName: 'Jane' },
    } as unknown as Record<string, unknown>;
    mutateMock.mockResolvedValueOnce({
      data: { updateProfile: mockUpdatedProfile },
    });

    const result = await store.updateProfile({ firstName: 'John' });

    expect(mutateMock).toHaveBeenCalled();
    expect(result).toEqual(mockUpdatedProfile);
    expect(store.user?.profile?.firstName).toBe('John');
  });

  it('handles update profile error', async () => {
    const store = useEmployeesStore();
    mutateMock.mockRejectedValueOnce(new Error('Update profile failed'));

    await expect(store.updateProfile({ firstName: 'John' })).rejects.toThrow(
      'Update profile failed'
    );
  });

  it('uploads an avatar', async () => {
    const store = useEmployeesStore();
    const mockAvatar = 'avatar.jpg';
    store.user = { id: '1', profile: { avatar: null } } as unknown as Record<
      string,
      unknown
    >;
    mutateMock.mockResolvedValueOnce({ data: { uploadAvatar: mockAvatar } });

    const result = await store.uploadAvatar({
      base64: 'data:image/jpeg;base64,...',
      size: 100,
      type: 'image/jpeg',
    });

    expect(mutateMock).toHaveBeenCalled();
    expect(result).toEqual(mockAvatar);
    expect(store.user?.profile?.avatar).toBe(mockAvatar);
  });

  it('handles upload avatar error', async () => {
    const store = useEmployeesStore();
    mutateMock.mockRejectedValueOnce(new Error('Upload failed'));

    await expect(
      store.uploadAvatar({ base64: 'data...', size: 100, type: 'image/jpeg' })
    ).rejects.toThrow('Upload failed');
  });

  it('deletes an avatar', async () => {
    const store = useEmployeesStore();
    store.user = {
      id: '1',
      profile: { avatar: 'avatar.jpg' },
    } as unknown as Record<string, unknown>;
    mutateMock.mockResolvedValueOnce({ data: { deleteAvatar: true } });

    await store.deleteAvatar({ avatar: 'avatar.jpg' });

    expect(mutateMock).toHaveBeenCalled();
    expect(store.user?.profile?.avatar).toBeNull();
  });

  it('handles delete avatar error', async () => {
    const store = useEmployeesStore();
    mutateMock.mockRejectedValueOnce(new Error('Delete failed'));

    await expect(store.deleteAvatar({ avatar: 'avatar.jpg' })).rejects.toThrow(
      'Delete failed'
    );
  });

  it('fetches profile languages successfully', async () => {
    const store = useEmployeesStore();
    const mockLangs = [{ id: '1', languageId: '2', proficiency: 'B2' }];
    queryMock.mockResolvedValueOnce({
      data: { profile: { languages: mockLangs } },
    });

    await store.fetchProfileLanguages('1');

    expect(queryMock).toHaveBeenCalled();
    expect(store.profileLanguages).toEqual(mockLangs);
  });

  it('handles fetch profile languages error', async () => {
    const store = useEmployeesStore();
    queryMock.mockRejectedValueOnce(new Error('Fetch failed'));

    await store.fetchProfileLanguages('1');

    expect(store.error).toBe('Fetch failed');
  });

  it('adds profile language', async () => {
    const store = useEmployeesStore();
    const mockLangs = [{ id: '1', proficiency: 'C1' }];
    mutateMock.mockResolvedValueOnce({
      data: { addProfileLanguage: { languages: mockLangs } },
    });

    await store.addProfileLanguage({
      userId: '1',
      languageId: '2',
      proficiency: 'C1',
    });

    expect(store.profileLanguages).toEqual(mockLangs);
  });

  it('handles add profile language error', async () => {
    const store = useEmployeesStore();
    mutateMock.mockRejectedValueOnce(new Error('Add failed'));

    await expect(
      store.addProfileLanguage({
        userId: '1',
        languageId: '2',
        proficiency: 'C1',
      })
    ).rejects.toThrow('Add failed');
  });

  it('updates profile language', async () => {
    const store = useEmployeesStore();
    const mockLangs = [{ id: '1', proficiency: 'C2' }];
    mutateMock.mockResolvedValueOnce({
      data: { updateProfileLanguage: { languages: mockLangs } },
    });

    await store.updateProfileLanguage({
      id: '1',
      userId: '1',
      languageId: '2',
      proficiency: 'C2',
    });

    expect(store.profileLanguages).toEqual(mockLangs);
  });

  it('handles update profile language error', async () => {
    const store = useEmployeesStore();
    mutateMock.mockRejectedValueOnce(new Error('Update failed'));

    await expect(
      store.updateProfileLanguage({
        id: '1',
        userId: '1',
        languageId: '2',
        proficiency: 'C2',
      })
    ).rejects.toThrow('Update failed');
  });

  it('deletes profile language', async () => {
    const store = useEmployeesStore();
    const mockLangs: unknown[] = [];
    mutateMock.mockResolvedValueOnce({
      data: { deleteProfileLanguage: { languages: mockLangs } },
    });

    await store.deleteProfileLanguage({
      id: '1',
      userId: '1',
      languageId: '2',
    });

    expect(store.profileLanguages).toEqual(mockLangs);
  });

  it('handles delete profile language error', async () => {
    const store = useEmployeesStore();
    mutateMock.mockRejectedValueOnce(new Error('Delete failed'));

    await expect(
      store.deleteProfileLanguage({ id: '1', userId: '1', languageId: '2' })
    ).rejects.toThrow('Delete failed');
  });

  it('fetches profile skills successfully', async () => {
    const store = useEmployeesStore();
    const mockSkills = [{ id: '1', skillId: '2' }];
    queryMock.mockResolvedValueOnce({
      data: { profile: { skills: mockSkills } },
    });

    await store.fetchProfileSkills('1');

    expect(queryMock).toHaveBeenCalled();
    expect(store.profileSkills).toEqual(mockSkills);
  });

  it('handles fetch profile skills error', async () => {
    const store = useEmployeesStore();
    queryMock.mockRejectedValueOnce(new Error('Fetch failed'));

    await store.fetchProfileSkills('1');

    expect(store.error).toBe('Fetch failed');
  });

  it('adds profile skill', async () => {
    const store = useEmployeesStore();
    const mockSkills = [{ id: '1', skillId: '2' }];
    mutateMock.mockResolvedValueOnce({
      data: { addProfileSkill: { skills: mockSkills } },
    });

    await store.addProfileSkill({ userId: '1', skillId: '2' });

    expect(store.profileSkills).toEqual(mockSkills);
  });

  it('handles add profile skill error', async () => {
    const store = useEmployeesStore();
    mutateMock.mockRejectedValueOnce(new Error('Add failed'));

    await expect(
      store.addProfileSkill({ userId: '1', skillId: '2' })
    ).rejects.toThrow('Add failed');
  });

  it('updates profile skill', async () => {
    const store = useEmployeesStore();
    const mockSkills = [{ id: '1', skillId: '2' }];
    mutateMock.mockResolvedValueOnce({
      data: { updateProfileSkill: { skills: mockSkills } },
    });

    await store.updateProfileSkill({ id: '1', userId: '1', skillId: '2' });

    expect(store.profileSkills).toEqual(mockSkills);
  });

  it('handles update profile skill error', async () => {
    const store = useEmployeesStore();
    mutateMock.mockRejectedValueOnce(new Error('Update failed'));

    await expect(
      store.updateProfileSkill({ id: '1', userId: '1', skillId: '2' })
    ).rejects.toThrow('Update failed');
  });

  it('deletes profile skill', async () => {
    const store = useEmployeesStore();
    const mockSkills: unknown[] = [];
    mutateMock.mockResolvedValueOnce({
      data: { deleteProfileSkill: { skills: mockSkills } },
    });

    await store.deleteProfileSkill({ id: '1', userId: '1', skillId: '2' });

    expect(store.profileSkills).toEqual(mockSkills);
  });

  it('handles delete profile skill error', async () => {
    const store = useEmployeesStore();
    mutateMock.mockRejectedValueOnce(new Error('Delete failed'));

    await expect(
      store.deleteProfileSkill({ id: '1', userId: '1', skillId: '2' })
    ).rejects.toThrow('Delete failed');
  });
});
