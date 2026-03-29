import {
  GetProfileSkillsDocument,
  GetSkillsDocument,
  GetSkillCategoriesDocument,
  AddProfileSkillDocument,
  UpdateProfileSkillDocument,
  DeleteProfileSkillDocument,
} from '../../graphql/generated/graphql';
import type {
  GetProfileSkillsQuery,
  GetSkillsQuery,
  GetSkillCategoriesQuery,
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
    const { data: fetchedData, error: fetchError } = await useAsyncData(
      'skills',
      async () => {
        const { data } = await client!.query({
          query: GetSkillsDocument,
        });
        return data.skills;
      }
    );

    if (fetchError.value) {
      console.error('Failed to fetch skills', fetchError.value);
      return [];
    }

    if (fetchedData.value) {
      skillsList.value = fetchedData.value;
    }
    return fetchedData.value || [];
  };

  const fetchCategories = async () => {
    const { data: fetchedData, error: fetchError } = await useAsyncData(
      'skill-categories',
      async () => {
        const { data } = await client!.query({
          query: GetSkillCategoriesDocument,
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

  const addSkill = async (input: AddProfileSkillInput) => {
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

  const updateSkill = async (input: UpdateProfileSkillInput) => {
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

  const deleteSkill = async (input: DeleteProfileSkillInput) => {
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
    addSkill,
    updateSkill,
    deleteSkill,
  };
};
