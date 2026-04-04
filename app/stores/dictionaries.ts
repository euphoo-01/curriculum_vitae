import { defineStore } from 'pinia';
import {
  GetDepartmentsDocument,
  CreateDepartmentDocument,
  UpdateDepartmentDocument,
  DeleteDepartmentDocument,
  GetPositionsDocument,
  CreatePositionDocument,
  UpdatePositionDocument,
  DeletePositionDocument,
  GetLanguagesDocument,
  CreateLanguageDocument,
  UpdateLanguageDocument,
  DeleteLanguageDocument,
  GetSkillsDocument,
  GetSkillCategoriesDocument,
  CreateSkillDocument,
  UpdateSkillDocument,
  DeleteSkillDocument,
} from '../../graphql/generated/graphql';
import type {
  GetDepartmentsQuery,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  GetPositionsQuery,
  CreatePositionInput,
  UpdatePositionInput,
  GetLanguagesQuery,
  CreateLanguageInput,
  UpdateLanguageInput,
  GetSkillsQuery,
  GetSkillCategoriesQuery,
  CreateSkillInput,
  UpdateSkillInput,
} from '../../graphql/generated/graphql';

export const useDictionariesStore = defineStore('dictionaries', () => {
  const departments = ref<GetDepartmentsQuery['departments']>([]);
  const positions = ref<GetPositionsQuery['positions']>([]);
  const languagesList = ref<GetLanguagesQuery['languages']>([]);
  const skillsList = ref<GetSkillsQuery['skills']>([]);
  const categoriesList = ref<GetSkillCategoriesQuery['skillCategories']>([]);

  const loading = ref(false);
  const error = ref<Error | null>(null);

  const fetchDepartments = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.query({
        query: GetDepartmentsDocument,
        fetchPolicy: 'network-only',
      });
      departments.value = data.departments;
      return data.departments;
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to fetch departments');
      return [];
    } finally {
      loading.value = false;
    }
  };

  const createDepartment = async (department: CreateDepartmentInput) => {
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      await $apollo.defaultClient.mutate({
        mutation: CreateDepartmentDocument,
        variables: { department },
      });
      await fetchDepartments();
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to create department');
      throw e;
    }
  };

  const updateDepartment = async (department: UpdateDepartmentInput) => {
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      await $apollo.defaultClient.mutate({
        mutation: UpdateDepartmentDocument,
        variables: { department },
      });
      await fetchDepartments();
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to update department');
      throw e;
    }
  };

  const deleteDepartment = async (departmentId: string) => {
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      await $apollo.defaultClient.mutate({
        mutation: DeleteDepartmentDocument,
        variables: { departmentId },
      });
      await fetchDepartments();
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to delete department');
      throw e;
    }
  };

  const fetchPositions = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.query({
        query: GetPositionsDocument,
        fetchPolicy: 'network-only',
      });
      positions.value = data.positions;
      return data.positions;
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to fetch positions');
      return [];
    } finally {
      loading.value = false;
    }
  };

  const createPosition = async (position: CreatePositionInput) => {
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      await $apollo.defaultClient.mutate({
        mutation: CreatePositionDocument,
        variables: { position },
      });
      await fetchPositions();
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to create position');
      throw e;
    }
  };

  const updatePosition = async (position: UpdatePositionInput) => {
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      await $apollo.defaultClient.mutate({
        mutation: UpdatePositionDocument,
        variables: { position },
      });
      await fetchPositions();
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to update position');
      throw e;
    }
  };

  const deletePosition = async (positionId: string) => {
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      await $apollo.defaultClient.mutate({
        mutation: DeletePositionDocument,
        variables: { positionId },
      });
      await fetchPositions();
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to delete position');
      throw e;
    }
  };

  const fetchLanguages = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.query({
        query: GetLanguagesDocument,
        fetchPolicy: 'network-only',
      });
      languagesList.value = data.languages;
      return data.languages;
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to fetch languages');
      return [];
    } finally {
      loading.value = false;
    }
  };

  const createLanguage = async (language: CreateLanguageInput) => {
    try {
      const { $apollo } = useNuxtApp();
      await $apollo.defaultClient.mutate({
        mutation: CreateLanguageDocument,
        variables: { language },
      });
      await fetchLanguages();
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to create language');
    }
  };

  const updateLanguage = async (language: UpdateLanguageInput) => {
    try {
      const { $apollo } = useNuxtApp();
      await $apollo.defaultClient.mutate({
        mutation: UpdateLanguageDocument,
        variables: { language },
      });
      await fetchLanguages();
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to update language');
    }
  };

  const deleteLanguage = async (languageId: string) => {
    try {
      const { $apollo } = useNuxtApp();
      await $apollo.defaultClient.mutate({
        mutation: DeleteLanguageDocument,
        variables: { languageId },
      });
      await fetchLanguages();
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to delete language');
    }
  };

  const fetchSkills = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.query({
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
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.query({
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
      const { $apollo } = useNuxtApp();
      await $apollo.defaultClient.mutate({
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
      const { $apollo } = useNuxtApp();
      await $apollo.defaultClient.mutate({
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
      const { $apollo } = useNuxtApp();
      await $apollo.defaultClient.mutate({
        mutation: DeleteSkillDocument,
        variables: { skillId },
      });
      await fetchSkills();
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to delete skill');
    }
  };

  return {
    departments,
    positions,
    languagesList,
    skillsList,
    categoriesList,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    fetchPositions,
    createPosition,
    updatePosition,
    deletePosition,
    fetchLanguages,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    fetchSkills,
    fetchCategories,
    createSkill,
    updateSkill,
    deleteSkill,
  };
});
