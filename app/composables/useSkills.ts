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
    try {
      const { data } = await client!.query({
        query: GetProfileSkillsDocument,
        variables: { userId },
        fetchPolicy: 'network-only',
      });
      profileSkills.value = data.profile.skills;
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to fetch profile skills');
    } finally {
      loading.value = false;
    }
  };

  const fetchSkills = async () => {
    try {
      const { data } = await client!.query({
        query: GetSkillsDocument,
      });
      skillsList.value = data.skills;
      return data.skills;
    } catch (e) {
      console.error('Failed to fetch skills', e);
      return [];
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await client!.query({
        query: GetSkillCategoriesDocument,
      });
      categoriesList.value = data.skillCategories;
      return data.skillCategories;
    } catch (e) {
      console.error('Failed to fetch skill categories', e);
      return [];
    }
  };

  const addSkill = async (input: AddProfileSkillInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: AddProfileSkillDocument,
        variables: { skill: input },
      });
      if (data?.addProfileSkill) {
        profileSkills.value = data.addProfileSkill.skills;
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
