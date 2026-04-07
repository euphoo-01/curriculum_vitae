import {
  UsersDocument,
  DeleteUserDocument,
  CreateUserDocument,
  GetUserDocument,
  UpdateUserDocument,
  UpdateProfileDocument,
  UploadAvatarDocument,
  DeleteAvatarDocument,
  GetProfileLanguagesDocument,
  AddProfileLanguageDocument,
  UpdateProfileLanguageDocument,
  DeleteProfileLanguageDocument,
  GetProfileSkillsDocument,
  AddProfileSkillDocument,
  UpdateProfileSkillDocument,
  DeleteProfileSkillDocument,
} from '../../graphql/generated/graphql';
import type {
  UsersQuery,
  CreateUserInput,
  GetUserQuery,
  UpdateUserInput,
  UpdateProfileInput,
  UploadAvatarInput,
  DeleteAvatarInput,
  GetProfileLanguagesQuery,
  AddProfileLanguageInput,
  UpdateProfileLanguageInput,
  DeleteProfileLanguageInput,
  GetProfileSkillsQuery,
  AddProfileSkillInput,
  UpdateProfileSkillInput,
  DeleteProfileSkillInput,
} from '../../graphql/generated/graphql';

export const useEmployeesStore = defineStore('employees', () => {
  const users = ref<UsersQuery['users']>([]);
  const user = ref<GetUserQuery['user'] | null>(null);

  const profileLanguages = ref<
    GetProfileLanguagesQuery['profile']['languages']
  >([]);
  const profileSkills = ref<GetProfileSkillsQuery['profile']['skills']>([]);

  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.query({
        query: UsersDocument,
        fetchPolicy: 'network-only',
      });
      users.value = data.users;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch users';
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (id: string) => {
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      await $apollo.defaultClient.mutate({
        mutation: DeleteUserDocument,
        variables: { userId: id },
      });
      await fetchUsers();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete user';
    }
  };

  const createUser = async (input: CreateUserInput) => {
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      await $apollo.defaultClient.mutate({
        mutation: CreateUserDocument,
        variables: { user: input },
      });
      await fetchUsers();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create user';
    }
  };

  const fetchUser = async (userId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.query({
        query: GetUserDocument,
        variables: { userId },
        fetchPolicy: 'network-only',
      });
      user.value = data.user;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : 'Failed to fetch user profile';
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (input: UpdateUserInput) => {
    try {
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.mutate({
        mutation: UpdateUserDocument,
        variables: { user: input },
      });
      if (data?.updateUser && user.value) {
        user.value = { ...user.value, ...data.updateUser };
      }
      return data?.updateUser;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to update user');
    }
  };

  const updateProfile = async (input: UpdateProfileInput) => {
    try {
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.mutate({
        mutation: UpdateProfileDocument,
        variables: { profile: input },
      });
      if (data?.updateProfile && user.value) {
        user.value = {
          ...user.value,
          profile: { ...user.value.profile, ...data.updateProfile },
        };
      }
      return data?.updateProfile;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to update profile');
    }
  };

  const uploadAvatar = async (input: UploadAvatarInput) => {
    try {
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.mutate({
        mutation: UploadAvatarDocument,
        variables: { avatar: input },
      });
      if (data?.uploadAvatar && user.value) {
        user.value = {
          ...user.value,
          profile: { ...user.value.profile, avatar: data.uploadAvatar },
        };
      }
      return data?.uploadAvatar;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to upload avatar');
    }
  };

  const deleteAvatar = async (input: DeleteAvatarInput) => {
    try {
      const { $apollo } = useNuxtApp();
      await $apollo.defaultClient.mutate({
        mutation: DeleteAvatarDocument,
        variables: { avatar: input },
      });
      if (user.value) {
        user.value = {
          ...user.value,
          profile: { ...user.value.profile, avatar: null },
        };
      }
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to delete avatar');
    }
  };

  const fetchProfileLanguages = async (userId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.query({
        query: GetProfileLanguagesDocument,
        variables: { userId },
        fetchPolicy: 'network-only',
      });
      profileLanguages.value = data.profile.languages;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : 'Failed to fetch profile languages';
    } finally {
      loading.value = false;
    }
  };

  const addProfileLanguage = async (input: AddProfileLanguageInput) => {
    try {
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.mutate({
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

  const updateProfileLanguage = async (input: UpdateProfileLanguageInput) => {
    try {
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.mutate({
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

  const deleteProfileLanguage = async (input: DeleteProfileLanguageInput) => {
    try {
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.mutate({
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

  const fetchProfileSkills = async (userId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.query({
        query: GetProfileSkillsDocument,
        variables: { userId },
        fetchPolicy: 'network-only',
      });
      profileSkills.value = data.profile.skills;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : 'Failed to fetch profile skills';
    } finally {
      loading.value = false;
    }
  };

  const addProfileSkill = async (input: AddProfileSkillInput) => {
    try {
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.mutate({
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
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.mutate({
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
      const { $apollo } = useNuxtApp();
      const { data } = await $apollo.defaultClient.mutate({
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
    users,
    user,
    profileLanguages,
    profileSkills,
    loading,
    error,
    fetchUsers,
    deleteUser,
    createUser,
    fetchUser,
    updateUser,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    fetchProfileLanguages,
    addProfileLanguage,
    updateProfileLanguage,
    deleteProfileLanguage,
    fetchProfileSkills,
    addProfileSkill,
    updateProfileSkill,
    deleteProfileSkill,
  };
});
