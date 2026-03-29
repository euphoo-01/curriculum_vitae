import {
  GetProfileLanguagesDocument,
  GetLanguagesDocument,
  CreateLanguageDocument,
  UpdateLanguageDocument,
  DeleteLanguageDocument,
  AddProfileLanguageDocument,
  UpdateProfileLanguageDocument,
  DeleteProfileLanguageDocument,
} from '../../graphql/generated/graphql';
import type {
  GetProfileLanguagesQuery,
  GetLanguagesQuery,
  CreateLanguageInput,
  UpdateLanguageInput,
  AddProfileLanguageInput,
  UpdateProfileLanguageInput,
  DeleteProfileLanguageInput,
} from '../../graphql/generated/graphql';

export const useLanguages = () => {
  const { clients } = useApollo();
  const client = clients?.default;

  const profileLanguages = ref<
    GetProfileLanguagesQuery['profile']['languages']
  >([]);
  const languagesList = ref<GetLanguagesQuery['languages']>([]);

  const loading = ref(false);
  const error = ref<Error | null>(null);

  const fetchProfileLanguages = async (userId: string) => {
    loading.value = true;
    error.value = null;

    const { data: fetchedData, error: fetchError } = await useAsyncData(
      `profile-languages-${userId}`,
      async () => {
        const { data } = await client!.query({
          query: GetProfileLanguagesDocument,
          variables: { userId },
          fetchPolicy: 'network-only',
        });
        return data.profile.languages;
      }
    );

    if (fetchError.value) {
      error.value =
        fetchError.value instanceof Error
          ? fetchError.value
          : new Error('Failed to fetch profile languages');
    } else if (fetchedData.value) {
      profileLanguages.value = fetchedData.value;
    }

    loading.value = false;
  };

  const fetchLanguages = async () => {
    loading.value = true;
    const { data: fetchedData, error: fetchError } = await useAsyncData(
      'languages',
      async () => {
        const { data } = await client!.query({
          query: GetLanguagesDocument,
          fetchPolicy: 'network-only',
        });
        return data.languages;
      }
    );

    if (fetchError.value) {
      error.value = fetchError.value instanceof Error ? fetchError.value : new Error('Failed to fetch languages');
      loading.value = false;
      return [];
    }

    if (fetchedData.value) {
      languagesList.value = fetchedData.value;
    }
    loading.value = false;
    return fetchedData.value || [];
  };

  const createLanguage = async (language: CreateLanguageInput) => {
    try {
      await client!.mutate({
        mutation: CreateLanguageDocument,
        variables: { language },
      });
      clearNuxtData('languages');
      await fetchLanguages();
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to create language');
    }
  };

  const updateLanguage = async (language: UpdateLanguageInput) => {
    try {
      await client!.mutate({
        mutation: UpdateLanguageDocument,
        variables: { language },
      });
      clearNuxtData('languages');
      await fetchLanguages();
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to update language');
    }
  };

  const deleteLanguage = async (languageId: string) => {
    try {
      await client!.mutate({
        mutation: DeleteLanguageDocument,
        variables: { languageId },
      });
      clearNuxtData('languages');
      await fetchLanguages();
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to delete language');
    }
  };

  const addProfileLanguage = async (input: AddProfileLanguageInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: AddProfileLanguageDocument,
        variables: { language: input },
      });
      if (data?.addProfileLanguage) {
        profileLanguages.value = data.addProfileLanguage.languages;
        clearNuxtData((k) => k.startsWith('profile-languages-'));
      }
    } catch (e) {
      throw e instanceof Error
        ? e
        : new Error('Failed to add profile language');
    }
  };

  const updateProfileLanguage = async (input: UpdateProfileLanguageInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: UpdateProfileLanguageDocument,
        variables: { language: input },
      });
      if (data?.updateProfileLanguage) {
        profileLanguages.value = data.updateProfileLanguage.languages;
        clearNuxtData((k) => k.startsWith('profile-languages-'));
      }
    } catch (e) {
      throw e instanceof Error
        ? e
        : new Error('Failed to update profile language');
    }
  };

  const deleteProfileLanguage = async (input: DeleteProfileLanguageInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: DeleteProfileLanguageDocument,
        variables: { language: input },
      });
      if (data?.deleteProfileLanguage) {
        profileLanguages.value = data.deleteProfileLanguage.languages;
        clearNuxtData((k) => k.startsWith('profile-languages-'));
      }
    } catch (e) {
      throw e instanceof Error
        ? e
        : new Error('Failed to delete profile language');
    }
  };

  return {
    profileLanguages,
    languagesList,
    loading,
    error,
    fetchProfileLanguages,
    fetchLanguages,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    addProfileLanguage,
    updateProfileLanguage,
    deleteProfileLanguage,
  };
};
