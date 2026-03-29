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
    try {
      const { data } = await client!.query({
        query: GetProfileLanguagesDocument,
        variables: { userId },
        fetchPolicy: 'network-only',
      });
      profileLanguages.value = data.profile.languages;
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to fetch profile languages');
    } finally {
      loading.value = false;
    }
  };

  const fetchLanguages = async () => {
    try {
      const { data } = await client!.query({
        query: GetLanguagesDocument,
      });
      languagesList.value = data.languages;
      return data.languages;
    } catch (e) {
      console.error('Failed to fetch languages', e);
      return [];
    }
  };

  const addLanguage = async (input: AddProfileLanguageInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: AddProfileLanguageDocument,
        variables: { language: input },
      });
      if (data?.addProfileLanguage) {
        profileLanguages.value = data.addProfileLanguage.languages;
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
