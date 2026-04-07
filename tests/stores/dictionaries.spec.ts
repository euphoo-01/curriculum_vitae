import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDictionariesStore } from '../../app/stores/dictionaries';
import { useNuxtApp } from '#imports';

interface ApolloClientMock {
  mutate: ReturnType<typeof vi.fn>;
  query: ReturnType<typeof vi.fn>;
}

const mutateMock = vi.fn();
const queryMock = vi.fn();

describe('Dictionaries Store', () => {
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

  it('fetches departments successfully', async () => {
    const store = useDictionariesStore();
    const mockDepartments = [{ id: '1', name: 'HR' }];
    queryMock.mockResolvedValueOnce({ data: { departments: mockDepartments } });

    const result = await store.fetchDepartments();

    expect(queryMock).toHaveBeenCalled();
    expect(store.departments).toEqual(mockDepartments);
    expect(result).toEqual(mockDepartments);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('handles fetch departments error', async () => {
    const store = useDictionariesStore();
    queryMock.mockRejectedValueOnce(new Error('Fetch failed'));

    const result = await store.fetchDepartments();

    expect(store.error).toBe('Fetch failed');
    expect(result).toEqual([]);
    expect(store.loading).toBe(false);
  });

  it('creates a department', async () => {
    const store = useDictionariesStore();
    mutateMock.mockResolvedValueOnce({});
    queryMock.mockResolvedValueOnce({ data: { departments: [] } });

    await store.createDepartment({ name: 'IT' });

    expect(mutateMock).toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalled();
  });

  it('handles create department error', async () => {
    const store = useDictionariesStore();
    mutateMock.mockRejectedValueOnce(new Error('Create failed'));

    await expect(store.createDepartment({ name: 'IT' })).rejects.toThrow(
      'Create failed'
    );
    expect(store.error).toBe('Create failed');
  });

  it('updates a department', async () => {
    const store = useDictionariesStore();
    mutateMock.mockResolvedValueOnce({});
    queryMock.mockResolvedValueOnce({ data: { departments: [] } });

    await store.updateDepartment({ id: '1', name: 'IT Updated' });

    expect(mutateMock).toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalled();
  });

  it('handles update department error', async () => {
    const store = useDictionariesStore();
    mutateMock.mockRejectedValueOnce(new Error('Update failed'));

    await expect(
      store.updateDepartment({ id: '1', name: 'IT Updated' })
    ).rejects.toThrow('Update failed');
    expect(store.error).toBe('Update failed');
  });

  it('deletes a department', async () => {
    const store = useDictionariesStore();
    mutateMock.mockResolvedValueOnce({});
    queryMock.mockResolvedValueOnce({ data: { departments: [] } });

    await store.deleteDepartment('1');

    expect(mutateMock).toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalled();
  });

  it('handles delete department error', async () => {
    const store = useDictionariesStore();
    mutateMock.mockRejectedValueOnce(new Error('Delete failed'));

    await expect(store.deleteDepartment('1')).rejects.toThrow('Delete failed');
    expect(store.error).toBe('Delete failed');
  });

  it('fetches positions successfully', async () => {
    const store = useDictionariesStore();
    const mockPositions = [{ id: '1', name: 'Dev' }];
    queryMock.mockResolvedValueOnce({ data: { positions: mockPositions } });

    const result = await store.fetchPositions();

    expect(queryMock).toHaveBeenCalled();
    expect(store.positions).toEqual(mockPositions);
    expect(result).toEqual(mockPositions);
  });

  it('handles fetch positions error', async () => {
    const store = useDictionariesStore();
    queryMock.mockRejectedValueOnce(new Error('Fetch failed'));

    const result = await store.fetchPositions();

    expect(store.error).toBe('Fetch failed');
    expect(result).toEqual([]);
  });

  it('creates a position', async () => {
    const store = useDictionariesStore();
    mutateMock.mockResolvedValueOnce({});
    queryMock.mockResolvedValueOnce({ data: { positions: [] } });

    await store.createPosition({ name: 'Dev' });

    expect(mutateMock).toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalled();
  });

  it('handles create position error', async () => {
    const store = useDictionariesStore();
    mutateMock.mockRejectedValueOnce(new Error('Create failed'));

    await expect(store.createPosition({ name: 'Dev' })).rejects.toThrow(
      'Create failed'
    );
  });

  it('updates a position', async () => {
    const store = useDictionariesStore();
    mutateMock.mockResolvedValueOnce({});
    queryMock.mockResolvedValueOnce({ data: { positions: [] } });

    await store.updatePosition({ id: '1', name: 'Dev Updated' });

    expect(mutateMock).toHaveBeenCalled();
  });

  it('handles update position error', async () => {
    const store = useDictionariesStore();
    mutateMock.mockRejectedValueOnce(new Error('Update failed'));

    await expect(
      store.updatePosition({ id: '1', name: 'Dev Updated' })
    ).rejects.toThrow('Update failed');
  });

  it('deletes a position', async () => {
    const store = useDictionariesStore();
    mutateMock.mockResolvedValueOnce({});
    queryMock.mockResolvedValueOnce({ data: { positions: [] } });

    await store.deletePosition('1');

    expect(mutateMock).toHaveBeenCalled();
  });

  it('handles delete position error', async () => {
    const store = useDictionariesStore();
    mutateMock.mockRejectedValueOnce(new Error('Delete failed'));

    await expect(store.deletePosition('1')).rejects.toThrow('Delete failed');
  });

  it('fetches languages successfully', async () => {
    const store = useDictionariesStore();
    const mockLanguages = [{ id: '1', name: 'English' }];
    queryMock.mockResolvedValueOnce({ data: { languages: mockLanguages } });

    const result = await store.fetchLanguages();

    expect(queryMock).toHaveBeenCalled();
    expect(store.languagesList).toEqual(mockLanguages);
    expect(result).toEqual(mockLanguages);
  });

  it('handles fetch languages error', async () => {
    const store = useDictionariesStore();
    queryMock.mockRejectedValueOnce(new Error('Fetch failed'));

    const result = await store.fetchLanguages();

    expect(store.error).toBe('Fetch failed');
    expect(result).toEqual([]);
  });

  it('creates a language', async () => {
    const store = useDictionariesStore();
    mutateMock.mockResolvedValueOnce({});
    queryMock.mockResolvedValueOnce({ data: { languages: [] } });

    await store.createLanguage({ name: 'English', iso2: 'EN' });

    expect(mutateMock).toHaveBeenCalled();
  });

  it('handles create language error', async () => {
    const store = useDictionariesStore();
    mutateMock.mockRejectedValueOnce(new Error('Create failed'));

    await expect(
      store.createLanguage({ name: 'English', iso2: 'EN' })
    ).rejects.toThrow('Create failed');
  });

  it('updates a language', async () => {
    const store = useDictionariesStore();
    mutateMock.mockResolvedValueOnce({});
    queryMock.mockResolvedValueOnce({ data: { languages: [] } });

    await store.updateLanguage({
      id: '1',
      name: 'English Updated',
      iso2: 'EN',
    });

    expect(mutateMock).toHaveBeenCalled();
  });

  it('handles update language error', async () => {
    const store = useDictionariesStore();
    mutateMock.mockRejectedValueOnce(new Error('Update failed'));

    await expect(
      store.updateLanguage({ id: '1', name: 'English Updated', iso2: 'EN' })
    ).rejects.toThrow('Update failed');
  });

  it('deletes a language', async () => {
    const store = useDictionariesStore();
    mutateMock.mockResolvedValueOnce({});
    queryMock.mockResolvedValueOnce({ data: { languages: [] } });

    await store.deleteLanguage('1');

    expect(mutateMock).toHaveBeenCalled();
  });

  it('handles delete language error', async () => {
    const store = useDictionariesStore();
    mutateMock.mockRejectedValueOnce(new Error('Delete failed'));

    await expect(store.deleteLanguage('1')).rejects.toThrow('Delete failed');
  });

  it('fetches skills successfully', async () => {
    const store = useDictionariesStore();
    const mockSkills = [{ id: '1', name: 'Vue' }];
    queryMock.mockResolvedValueOnce({ data: { skills: mockSkills } });

    const result = await store.fetchSkills();

    expect(queryMock).toHaveBeenCalled();
    expect(store.skillsList).toEqual(mockSkills);
    expect(result).toEqual(mockSkills);
  });

  it('handles fetch skills error', async () => {
    const store = useDictionariesStore();
    queryMock.mockRejectedValueOnce(new Error('Fetch failed'));

    const result = await store.fetchSkills();

    expect(store.error).toBe('Fetch failed');
    expect(result).toEqual([]);
  });

  it('fetches skill categories successfully', async () => {
    const store = useDictionariesStore();
    const mockCategories = [{ id: '1', name: 'Frontend' }];
    queryMock.mockResolvedValueOnce({
      data: { skillCategories: mockCategories },
    });

    const result = await store.fetchCategories();

    expect(queryMock).toHaveBeenCalled();
    expect(store.categoriesList).toEqual(mockCategories);
    expect(result).toEqual(mockCategories);
  });

  it('handles fetch categories error', async () => {
    const store = useDictionariesStore();
    queryMock.mockRejectedValueOnce(new Error('Fetch failed'));

    const result = await store.fetchCategories();

    expect(result).toEqual([]);
  });

  it('creates a skill', async () => {
    const store = useDictionariesStore();
    mutateMock.mockResolvedValueOnce({});
    queryMock.mockResolvedValueOnce({ data: { skills: [] } });

    await store.createSkill({ name: 'Vue' });

    expect(mutateMock).toHaveBeenCalled();
  });

  it('handles create skill error', async () => {
    const store = useDictionariesStore();
    mutateMock.mockRejectedValueOnce(new Error('Create failed'));

    await expect(store.createSkill({ name: 'Vue' })).rejects.toThrow(
      'Create failed'
    );
  });

  it('updates a skill', async () => {
    const store = useDictionariesStore();
    mutateMock.mockResolvedValueOnce({});
    queryMock.mockResolvedValueOnce({ data: { skills: [] } });

    await store.updateSkill({ id: '1', name: 'Vue Updated' });

    expect(mutateMock).toHaveBeenCalled();
  });

  it('handles update skill error', async () => {
    const store = useDictionariesStore();
    mutateMock.mockRejectedValueOnce(new Error('Update failed'));

    await expect(
      store.updateSkill({ id: '1', name: 'Vue Updated' })
    ).rejects.toThrow('Update failed');
  });

  it('deletes a skill', async () => {
    const store = useDictionariesStore();
    mutateMock.mockResolvedValueOnce({});
    queryMock.mockResolvedValueOnce({ data: { skills: [] } });

    await store.deleteSkill('1');

    expect(mutateMock).toHaveBeenCalled();
  });

  it('handles delete skill error', async () => {
    const store = useDictionariesStore();
    mutateMock.mockRejectedValueOnce(new Error('Delete failed'));

    await expect(store.deleteSkill('1')).rejects.toThrow('Delete failed');
  });
});
