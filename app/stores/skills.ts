import { defineStore } from 'pinia';
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

export const useSkillsStore = defineStore('skills', () => {
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
    loading.value = true;
    error.value = null;

    try {
      const { data } = await client!.query({
        query: GetSkillsDocument,
        fetchPolicy: 'network-only',
      });
      skillsList.value = data.skills;
      return data.skills;
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to fetch skills');
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await client!.query({
        query: GetSkillCategoriesDocument,
        fetchPolicy: 'network-only',
      });
      categoriesList.value = data.skillCategories;
      return data.skillCategories;
    } catch (e) {
      console.error('Failed to fetch skill categories', e);
      return [];
    }
  };

  const createSkill = async (skill: CreateSkillInput) => {
    try {
      await client!.mutate({
        mutation: CreateSkillDocument,
        variables: { skill },
      });
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
});
