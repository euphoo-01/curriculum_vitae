import {
  GetProfileSkillsDocument,
  GetSkillsDocument,
  GetSkillCategoriesDocument,
  CreateSkillDocument,
  UpdateSkillDocument,
  DeleteSkillDocument,
  AddProfileSkillDocument,
  UpdateProfileSkillDocument,
  DeleteProfileSkillDocument,
} from '../../graphql/generated/graphql';
import type {
  GetProfileSkillsQuery,
  GetSkillsQuery,
  GetSkillCategoriesQuery,
  CreateSkillInput,
  UpdateSkillInput,
  AddProfileSkillInput,
  UpdateProfileSkillInput,
  DeleteProfileSkillInput,
} from '../../graphql/generated/graphql';

export const useSkills = () => {
  const { clients } = useApollo();
  const client = clients?.default;

  const profileSkills = ref<GetProfileSkillsQuery['profile']['skills']>([]);
  const skillsList = ref<GetSkillsQuery['skills']>([]);
  const categoriesList = ref<GetSkillCategoriesQuery['skillCategories']>([]);

  const loading = ref(false);
  const error = ref<Error | null>(null);

  const fetchProfileSkills = async (userId: string) => {
    loading.value = true;
    error.value = null;

    const { data: fetchedData, error: fetchError } = await useAsyncData(
      `profile-skills-${userId}`,
      async () => {
        const { data } = await client!.query({
          query: GetProfileSkillsDocument,
          variables: { userId },
          fetchPolicy: 'network-only',
        });
        return data.profile.skills;
      }
    );

    if (fetchError.value) {
      error.value =
        fetchError.value instanceof Error
          ? fetchError.value
          : new Error('Failed to fetch profile skills');
    } else if (fetchedData.value) {
      profileSkills.value = fetchedData.value;
    }

    loading.value = false;
  };

  const fetchSkills = async () => {
    loading.value = true;
    const { data: fetchedData, error: fetchError } = await useAsyncData(
      'skills',
      async () => {
        const { data } = await client!.query({
          query: GetSkillsDocument,
          fetchPolicy: 'network-only',
        });
        return data.skills;
      }
    );

    if (fetchError.value) {
      error.value =
        fetchError.value instanceof Error
          ? fetchError.value
          : new Error('Failed to fetch skills');
      loading.value = false;
      return [];
    }

    if (fetchedData.value) {
      skillsList.value = fetchedData.value;
    }
    loading.value = false;
    return fetchedData.value || [];
  };

  const fetchCategories = async () => {
    const { data: fetchedData, error: fetchError } = await useAsyncData(
      'skill-categories',
      async () => {
        const { data } = await client!.query({
          query: GetSkillCategoriesDocument,
          fetchPolicy: 'network-only',
        });
        return data.skillCategories;
      }
    );

    if (fetchError.value) {
      console.error('Failed to fetch skill categories', fetchError.value);
      return [];
    }

    if (fetchedData.value) {
      categoriesList.value = fetchedData.value;
    }
    return fetchedData.value || [];
  };

  const createSkill = async (skill: CreateSkillInput) => {
    try {
      await client!.mutate({
        mutation: CreateSkillDocument,
        variables: { skill },
      });
      clearNuxtData('skills');
      await fetchSkills();
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to create skill');
    }
  };

  const updateSkill = async (skill: UpdateSkillInput) => {
    try {
      await client!.mutate({
        mutation: UpdateSkillDocument,
        variables: { skill },
      });
      clearNuxtData('skills');
      await fetchSkills();
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to update skill');
    }
  };

  const deleteSkill = async (skillId: string) => {
    try {
      await client!.mutate({
        mutation: DeleteSkillDocument,
        variables: { skillId },
      });
      clearNuxtData('skills');
      await fetchSkills();
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to delete skill');
    }
  };

  const addProfileSkill = async (input: AddProfileSkillInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: AddProfileSkillDocument,
        variables: { skill: input },
      });
      if (data?.addProfileSkill) {
        profileSkills.value = data.addProfileSkill.skills;
        clearNuxtData((k) => k.startsWith('profile-skills-'));
      }
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to add profile skill');
    }
  };

  const updateProfileSkill = async (input: UpdateProfileSkillInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: UpdateProfileSkillDocument,
        variables: { skill: input },
      });
      if (data?.updateProfileSkill) {
        profileSkills.value = data.updateProfileSkill.skills;
        clearNuxtData((k) => k.startsWith('profile-skills-'));
      }
    } catch (e) {
      throw e instanceof Error
        ? e
        : new Error('Failed to update profile skill');
    }
  };

  const deleteProfileSkill = async (input: DeleteProfileSkillInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: DeleteProfileSkillDocument,
        variables: { skill: input },
      });
      if (data?.deleteProfileSkill) {
        profileSkills.value = data.deleteProfileSkill.skills;
        clearNuxtData((k) => k.startsWith('profile-skills-'));
      }
    } catch (e) {
      throw e instanceof Error
        ? e
        : new Error('Failed to delete profile skill');
    }
  };

  return {
    profileSkills,
    skillsList,
    categoriesList,
    loading,
    error,
    fetchProfileSkills,
    fetchSkills,
    fetchCategories,
    createSkill,
    updateSkill,
    deleteSkill,
    addProfileSkill,
    updateProfileSkill,
    deleteProfileSkill,
  };
};
