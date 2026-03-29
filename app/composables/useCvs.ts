import {
  GetUserCvsDocument,
  GetAllCvsDocument,
  GetCvDocument,
  CreateCvDocument,
  UpdateCvDocument,
  DeleteCvDocument,
  AddCvSkillDocument,
  UpdateCvSkillDocument,
  DeleteCvSkillDocument,
  AddCvProjectDocument,
  UpdateCvProjectDocument,
  RemoveCvProjectDocument,
} from '../../graphql/generated/graphql';
import type {
  GetUserCvsQuery,
  GetAllCvsQuery,
  GetCvQuery,
  CreateCvInput,
  UpdateCvInput,
  AddCvSkillInput,
  UpdateCvSkillInput,
  DeleteCvSkillInput,
  AddCvProjectInput,
  UpdateCvProjectInput,
  RemoveCvProjectInput,
} from '../../graphql/generated/graphql';

export const useCvs = () => {
  const { clients } = useApollo();
  const client = clients?.default;

  const cvs = ref<GetUserCvsQuery['user']['cvs']>([]);
  const allCvs = ref<GetAllCvsQuery['cvs']>([]);
  const currentCv = ref<GetCvQuery['cv'] | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const fetchUserCvs = async (userId: string) => {
    loading.value = true;
    error.value = null;

    const { data: fetchedData, error: fetchError } = await useAsyncData(
      `user-cvs-${userId}`,
      async () => {
        const { data } = await client!.query({
          query: GetUserCvsDocument,
          variables: { userId },
          fetchPolicy: 'network-only',
        });
        return data.user?.cvs || [];
      }
    );

    if (fetchError.value) {
      error.value =
        fetchError.value instanceof Error
          ? fetchError.value
          : new Error('Failed to fetch user CVs');
    } else if (fetchedData.value) {
      cvs.value = fetchedData.value;
    }

    loading.value = false;
  };

  const fetchAllCvs = async () => {
    loading.value = true;
    error.value = null;

    const { data: fetchedData, error: fetchError } = await useAsyncData(
      'all-cvs',
      async () => {
        const { data } = await client!.query({
          query: GetAllCvsDocument,
          fetchPolicy: 'network-only',
        });
        return data.cvs;
      }
    );

    if (fetchError.value) {
      error.value =
        fetchError.value instanceof Error
          ? fetchError.value
          : new Error('Failed to fetch all CVs');
    } else if (fetchedData.value) {
      allCvs.value = fetchedData.value;
    }

    loading.value = false;
  };

  const fetchCv = async (cvId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await client!.query({
        query: GetCvDocument,
        variables: { cvId },
        fetchPolicy: 'network-only',
      });
      currentCv.value = data.cv;
      return data.cv;
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to fetch CV');
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const createCv = async (input: CreateCvInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: CreateCvDocument,
        variables: { cv: input },
      });
      clearNuxtData((k) => k.startsWith('user-cvs-') || k === 'all-cvs');
      return data?.createCv;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to create CV');
    }
  };

  const updateCv = async (input: UpdateCvInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: UpdateCvDocument,
        variables: { cv: input },
      });
      clearNuxtData((k) => k.startsWith('user-cvs-') || k === 'all-cvs');
      return data?.updateCv;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to update CV');
    }
  };

  const deleteCv = async (cvId: string) => {
    try {
      const { data } = await client!.mutate({
        mutation: DeleteCvDocument,
        variables: { cvId },
      });
      clearNuxtData((k) => k.startsWith('user-cvs-') || k === 'all-cvs');
      return data?.deleteCv;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to delete CV');
    }
  };

  const addCvSkill = async (skill: AddCvSkillInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: AddCvSkillDocument,
        variables: { skill },
      });
      if (currentCv.value && currentCv.value.id === skill.cvId) {
        currentCv.value = { ...currentCv.value, skills: data?.addCvSkill.skills };
      }
      return data?.addCvSkill;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to add CV skill');
    }
  };

  const updateCvSkill = async (skill: UpdateCvSkillInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: UpdateCvSkillDocument,
        variables: { skill },
      });
      if (currentCv.value && currentCv.value.id === skill.cvId) {
        currentCv.value = { ...currentCv.value, skills: data?.updateCvSkill.skills };
      }
      return data?.updateCvSkill;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to update CV skill');
    }
  };

  const deleteCvSkill = async (skill: DeleteCvSkillInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: DeleteCvSkillDocument,
        variables: { skill },
      });
      if (currentCv.value && currentCv.value.id === skill.cvId) {
        currentCv.value = { ...currentCv.value, skills: data?.deleteCvSkill.skills };
      }
      return data?.deleteCvSkill;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to delete CV skill');
    }
  };

  const addCvProject = async (project: AddCvProjectInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: AddCvProjectDocument,
        variables: { project },
      });
      return data?.addCvProject;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to add CV project');
    }
  };

  const updateCvProject = async (project: UpdateCvProjectInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: UpdateCvProjectDocument,
        variables: { project },
      });
      return data?.updateCvProject;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to update CV project');
    }
  };

  const removeCvProject = async (project: RemoveCvProjectInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: RemoveCvProjectDocument,
        variables: { project },
      });
      return data?.removeCvProject;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to remove CV project');
    }
  };

  return {
    cvs,
    allCvs,
    currentCv,
    loading,
    error,
    fetchUserCvs,
    fetchAllCvs,
    fetchCv,
    createCv,
    updateCv,
    deleteCv,
    addCvSkill,
    updateCvSkill,
    deleteCvSkill,
    addCvProject,
    updateCvProject,
    removeCvProject,
  };
};
