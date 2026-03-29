import {
  GetProfileLanguagesDocument,
  GetLanguagesDocument,
  AddProfileLanguageDocument,
  UpdateProfileLanguageDocument,
  DeleteProfileLanguageDocument,
} from '../../graphql/generated/graphql';
import type {
  GetProfileLanguagesQuery,
  GetLanguagesQuery,
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
    const { data: fetchedData, error: fetchError } = await useAsyncData(
      'languages',
      async () => {
        const { data } = await client!.query({
          query: GetLanguagesDocument,
        });
        return data.languages;
      }
    );

    if (fetchError.value) {
      console.error('Failed to fetch languages', fetchError.value);
      return [];
    }

    if (fetchedData.value) {
      languagesList.value = fetchedData.value;
    }
    return fetchedData.value || [];
  };

  const addLanguage = async (input: AddProfileLanguageInput) => {
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

  const updateLanguage = async (input: UpdateProfileLanguageInput) => {
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

  const deleteLanguage = async (input: DeleteProfileLanguageInput) => {
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
    addLanguage,
    updateLanguage,
    deleteLanguage,
  };
};
