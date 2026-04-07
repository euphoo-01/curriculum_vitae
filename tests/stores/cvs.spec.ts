import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCvsStore } from '../../app/stores/cvs';
import { useNuxtApp } from '#imports';

interface CvSkill {
  name: string;
}

interface Cv {
  id: string;
  name: string;
  description?: string;
  education?: string;
  skills: CvSkill[];
  userId?: string;
}

interface ApolloClientMock {
  mutate: ReturnType<typeof vi.fn>;
  query: ReturnType<typeof vi.fn>;
}

const mutateMock = vi.fn();
const queryMock = vi.fn();

describe('CVs Store', () => {
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

  it('fetches user cvs successfully', async () => {
    const store = useCvsStore();
    const mockCvs = [{ id: '1', name: 'My CV' }];
    queryMock.mockResolvedValueOnce({ data: { user: { cvs: mockCvs } } });

    await store.fetchUserCvs('1');

    expect(queryMock).toHaveBeenCalled();
    expect(store.cvs).toEqual(mockCvs);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('handles fetch user cvs error', async () => {
    const store = useCvsStore();
    queryMock.mockRejectedValueOnce(new Error('Fetch failed'));

    await store.fetchUserCvs('1');

    expect(store.error).toBe('Fetch failed');
    expect(store.loading).toBe(false);
  });

  it('fetches all cvs successfully', async () => {
    const store = useCvsStore();
    const mockCvs = [{ id: '1', name: 'My CV' }];
    queryMock.mockResolvedValueOnce({ data: { cvs: mockCvs } });

    await store.fetchAllCvs();

    expect(queryMock).toHaveBeenCalled();
    expect(store.allCvs).toEqual(mockCvs);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('handles fetch all cvs error', async () => {
    const store = useCvsStore();
    queryMock.mockRejectedValueOnce(new Error('Fetch failed'));

    await store.fetchAllCvs();

    expect(store.error).toBe('Fetch failed');
    expect(store.loading).toBe(false);
  });

  it('fetches a single cv successfully', async () => {
    const store = useCvsStore();
    const mockCv = { id: '1', name: 'My CV' };
    queryMock.mockResolvedValueOnce({ data: { cv: mockCv } });

    const result = await store.fetchCv('1');

    expect(queryMock).toHaveBeenCalled();
    expect(store.currentCv).toEqual(mockCv);
    expect(result).toEqual(mockCv);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('handles fetch single cv error', async () => {
    const store = useCvsStore();
    queryMock.mockRejectedValueOnce(new Error('Fetch failed'));

    await expect(store.fetchCv('1')).rejects.toThrow('Fetch failed');
    expect(store.error).toBe('Fetch failed');
    expect(store.loading).toBe(false);
  });

  it('creates a cv', async () => {
    const store = useCvsStore();
    const mockCreatedCv = { id: '2', name: 'New CV' };
    mutateMock.mockResolvedValueOnce({ data: { createCv: mockCreatedCv } });

    const result = await store.createCv({
      name: 'New CV',
      description: '',
      education: '',
      userId: '1',
    });

    expect(mutateMock).toHaveBeenCalled();
    expect(result).toEqual(mockCreatedCv);
  });

  it('handles create cv error', async () => {
    const store = useCvsStore();
    mutateMock.mockRejectedValueOnce(new Error('Create failed'));

    await expect(
      store.createCv({
        name: 'New CV',
        description: '',
        education: '',
        userId: '1',
      })
    ).rejects.toThrow('Create failed');
  });

  it('updates a cv', async () => {
    const store = useCvsStore();
    const mockUpdatedCv = { id: '1', name: 'Updated CV' };
    mutateMock.mockResolvedValueOnce({ data: { updateCv: mockUpdatedCv } });

    const result = await store.updateCv({ id: '1', name: 'Updated CV' });

    expect(mutateMock).toHaveBeenCalled();
    expect(result).toEqual(mockUpdatedCv);
  });

  it('handles update cv error', async () => {
    const store = useCvsStore();
    mutateMock.mockRejectedValueOnce(new Error('Update failed'));

    await expect(
      store.updateCv({ id: '1', name: 'Updated CV' })
    ).rejects.toThrow('Update failed');
  });

  it('deletes a cv', async () => {
    const store = useCvsStore();
    mutateMock.mockResolvedValueOnce({ data: { deleteCv: true } });

    const result = await store.deleteCv('1');

    expect(mutateMock).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('handles delete cv error', async () => {
    const store = useCvsStore();
    mutateMock.mockRejectedValueOnce(new Error('Delete failed'));

    await expect(store.deleteCv('1')).rejects.toThrow('Delete failed');
  });

  it('adds a cv skill', async () => {
    const store = useCvsStore();
    const mockSkills: CvSkill[] = [{ name: 'Vue' }];
    store.currentCv = { id: '1', name: 'Test CV', skills: [] } as Cv;
    mutateMock.mockResolvedValueOnce({
      data: { addCvSkill: { skills: mockSkills } },
    });

    const result = await store.addCvSkill({
      cvId: '1',
      skillId: '2',
      mastery: 'Expert',
    });

    expect(mutateMock).toHaveBeenCalled();
    expect(result).toEqual({ skills: mockSkills });
    expect(store.currentCv?.skills).toEqual(mockSkills);
  });

  it('handles add cv skill error', async () => {
    const store = useCvsStore();
    mutateMock.mockRejectedValueOnce(new Error('Add failed'));

    await expect(
      store.addCvSkill({ cvId: '1', skillId: '2', mastery: 'Expert' })
    ).rejects.toThrow('Add failed');
  });

  it('updates a cv skill', async () => {
    const store = useCvsStore();
    const mockSkills: CvSkill[] = [{ name: 'Vue Updated' }];
    store.currentCv = { id: '1', name: 'Test CV', skills: [] } as Cv;
    mutateMock.mockResolvedValueOnce({
      data: { updateCvSkill: { skills: mockSkills } },
    });

    const result = await store.updateCvSkill({
      cvId: '1',
      skillId: '2',
      mastery: 'Novice',
    });

    expect(mutateMock).toHaveBeenCalled();
    expect(result).toEqual({ skills: mockSkills });
    expect(store.currentCv?.skills).toEqual(mockSkills);
  });

  it('handles update cv skill error', async () => {
    const store = useCvsStore();
    mutateMock.mockRejectedValueOnce(new Error('Update failed'));

    await expect(
      store.updateCvSkill({ cvId: '1', skillId: '2', mastery: 'Novice' })
    ).rejects.toThrow('Update failed');
  });

  it('deletes a cv skill', async () => {
    const store = useCvsStore();
    const mockSkills: CvSkill[] = [];
    store.currentCv = {
      id: '1',
      name: 'Test CV',
      skills: [{ name: 'Vue' }],
    } as Cv;
    mutateMock.mockResolvedValueOnce({
      data: { deleteCvSkill: { skills: mockSkills } },
    });

    const result = await store.deleteCvSkill({ cvId: '1', skillId: '2' });

    expect(mutateMock).toHaveBeenCalled();
    expect(result).toEqual({ skills: mockSkills });
    expect(store.currentCv?.skills).toEqual(mockSkills);
  });

  it('handles delete cv skill error', async () => {
    const store = useCvsStore();
    mutateMock.mockRejectedValueOnce(new Error('Delete failed'));

    await expect(
      store.deleteCvSkill({ cvId: '1', skillId: '2' })
    ).rejects.toThrow('Delete failed');
  });

  it('adds a cv project', async () => {
    const store = useCvsStore();
    const mockProject = { id: '2', name: 'Project A' };
    mutateMock.mockResolvedValueOnce({ data: { addCvProject: mockProject } });

    const result = await store.addCvProject({
      cvId: '1',
      projectId: '2',
      start: '',
      end: '',
      name: '',
      roles: [],
      responsibilities: [],
    });

    expect(mutateMock).toHaveBeenCalled();
    expect(result).toEqual(mockProject);
  });

  it('handles add cv project error', async () => {
    const store = useCvsStore();
    mutateMock.mockRejectedValueOnce(new Error('Add failed'));

    await expect(
      store.addCvProject({
        cvId: '1',
        projectId: '2',
        start: '',
        end: '',
        name: '',
        roles: [],
        responsibilities: [],
      })
    ).rejects.toThrow('Add failed');
  });

  it('updates a cv project', async () => {
    const store = useCvsStore();
    const mockProject = { id: '2', name: 'Project A Updated' };
    mutateMock.mockResolvedValueOnce({
      data: { updateCvProject: mockProject },
    });

    const result = await store.updateCvProject({
      cvId: '1',
      projectId: '2',
      start: '',
      end: '',
      name: '',
      roles: [],
      responsibilities: [],
    });

    expect(mutateMock).toHaveBeenCalled();
    expect(result).toEqual(mockProject);
  });

  it('handles update cv project error', async () => {
    const store = useCvsStore();
    mutateMock.mockRejectedValueOnce(new Error('Update failed'));

    await expect(
      store.updateCvProject({
        cvId: '1',
        projectId: '2',
        start: '',
        end: '',
        name: '',
        roles: [],
        responsibilities: [],
      })
    ).rejects.toThrow('Update failed');
  });

  it('removes a cv project', async () => {
    const store = useCvsStore();
    const mockProject = { id: '2' };
    mutateMock.mockResolvedValueOnce({
      data: { removeCvProject: mockProject },
    });

    const result = await store.removeCvProject({ cvId: '1', projectId: '2' });

    expect(mutateMock).toHaveBeenCalled();
    expect(result).toEqual(mockProject);
  });

  it('handles remove cv project error', async () => {
    const store = useCvsStore();
    mutateMock.mockRejectedValueOnce(new Error('Remove failed'));

    await expect(
      store.removeCvProject({ cvId: '1', projectId: '2' })
    ).rejects.toThrow('Remove failed');
  });

  it('exports pdf', async () => {
    const store = useCvsStore();
    const mockPdf = 'data:application/pdf;base64,...';
    mutateMock.mockResolvedValueOnce({ data: { exportPdf: mockPdf } });

    const result = await store.exportPdf({
      html: '<h1>CV</h1>',
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    expect(mutateMock).toHaveBeenCalled();
    expect(result).toEqual(mockPdf);
  });

  it('handles export pdf error', async () => {
    const store = useCvsStore();
    mutateMock.mockRejectedValueOnce(new Error('Export failed'));

    await expect(
      store.exportPdf({
        html: '<h1>CV</h1>',
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      })
    ).rejects.toThrow('Export failed');
  });
});
