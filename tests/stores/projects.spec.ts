import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProjectsStore } from '../../app/stores/projects';
import { useNuxtApp } from '#imports';

const mutateMock = vi.fn();
const queryMock = vi.fn();

describe('Projects Store', () => {
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

  it('fetches projects successfully', async () => {
    const store = useProjectsStore();
    const mockProjects = [{ id: '1', name: 'Project A' }];
    queryMock.mockResolvedValueOnce({ data: { projects: mockProjects } });

    await store.fetchProjects();

    expect(queryMock).toHaveBeenCalled();
    expect(store.projects).toEqual(mockProjects);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('handles fetch projects error', async () => {
    const store = useProjectsStore();
    queryMock.mockRejectedValueOnce(new Error('Fetch failed'));

    await store.fetchProjects();

    expect(store.error).toBe('Fetch failed');
    expect(store.loading).toBe(false);
  });

  it('fetches a single project', async () => {
    const store = useProjectsStore();
    const mockProject = { id: '1', name: 'Project A' };
    queryMock.mockResolvedValueOnce({ data: { project: mockProject } });

    const result = await store.fetchProject('1');

    expect(queryMock).toHaveBeenCalled();
    expect(result).toEqual(mockProject);
  });

  it('handles fetch a single project error', async () => {
    const store = useProjectsStore();
    queryMock.mockRejectedValueOnce(new Error('Fetch failed'));

    await expect(store.fetchProject('1')).rejects.toThrow('Fetch failed');
    expect(store.error).toBe('Fetch failed');
  });

  it('creates a project', async () => {
    const store = useProjectsStore();
    mutateMock.mockResolvedValueOnce({});
    queryMock.mockResolvedValueOnce({ data: { projects: [] } });

    await store.createProject({
      name: 'Project B',
      internalName: 'Project B',
      description: '',
      domain: '',
      startDate: '',
      endDate: '',
    });

    expect(mutateMock).toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalled();
  });

  it('handles create project error', async () => {
    const store = useProjectsStore();
    mutateMock.mockRejectedValueOnce(new Error('Create failed'));

    await expect(
      store.createProject({
        name: 'Project B',
        internalName: '',
        description: '',
        domain: '',
        startDate: '',
        endDate: '',
      })
    ).rejects.toThrow('Create failed');
    expect(store.error).toBe('Create failed');
  });

  it('updates a project', async () => {
    const store = useProjectsStore();
    mutateMock.mockResolvedValueOnce({});
    queryMock.mockResolvedValueOnce({ data: { projects: [] } });

    await store.updateProject({ id: '1', name: 'Project B Updated' });

    expect(mutateMock).toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalled();
  });

  it('handles update project error', async () => {
    const store = useProjectsStore();
    mutateMock.mockRejectedValueOnce(new Error('Update failed'));

    await expect(store.updateProject({ id: '1' })).rejects.toThrow(
      'Update failed'
    );
    expect(store.error).toBe('Update failed');
  });

  it('deletes a project', async () => {
    const store = useProjectsStore();
    mutateMock.mockResolvedValueOnce({});
    queryMock.mockResolvedValueOnce({ data: { projects: [] } });

    await store.deleteProject('1');

    expect(mutateMock).toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalled();
  });

  it('handles delete project error', async () => {
    const store = useProjectsStore();
    mutateMock.mockRejectedValueOnce(new Error('Delete failed'));

    await expect(store.deleteProject('1')).rejects.toThrow('Delete failed');
    expect(store.error).toBe('Delete failed');
  });
});
