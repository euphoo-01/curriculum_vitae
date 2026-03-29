import {
  GetUserDocument,
  GetDepartmentsDocument,
  GetPositionsDocument,
  UpdateUserDocument,
  UpdateProfileDocument,
  UploadAvatarDocument,
  DeleteAvatarDocument,
} from '../../graphql/generated/graphql';
import type {
  GetUserQuery,
  UpdateUserInput,
  UpdateProfileInput,
  UploadAvatarInput,
  DeleteAvatarInput,
} from '../../graphql/generated/graphql';

export const useProfile = () => {
  const { clients } = useApollo();
  const client = clients?.default;

  const user = ref<GetUserQuery['user'] | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const fetchUser = async (userId: string) => {
    loading.value = true;
    error.value = null;

    const { data: fetchedData, error: fetchError } = await useAsyncData(
      `user-${userId}`,
      async () => {
        const { data } = await client!.query({
          query: GetUserDocument,
          variables: { userId },
          fetchPolicy: 'network-only',
        });
        return data.user;
      }
    );

    if (fetchError.value) {
      error.value =
        fetchError.value instanceof Error
          ? fetchError.value
          : new Error('Failed to fetch user profile');
    } else if (fetchedData.value) {
      user.value = fetchedData.value;
    }

    loading.value = false;
  };

  const fetchDepartments = async () => {
    const { data: fetchedData, error: fetchError } = await useAsyncData(
      'departments',
      async () => {
        const { data } = await client!.query({
          query: GetDepartmentsDocument,
        });
        return data.departments;
      }
    );

    if (fetchError.value) {
      console.error('Failed to fetch departments', fetchError.value);
      return [];
    }

    return fetchedData.value || [];
  };

  const fetchPositions = async () => {
    const { data: fetchedData, error: fetchError } = await useAsyncData(
      'positions',
      async () => {
        const { data } = await client!.query({
          query: GetPositionsDocument,
        });
        return data.positions;
      }
    );

    if (fetchError.value) {
      console.error('Failed to fetch positions', fetchError.value);
      return [];
    }

    return fetchedData.value || [];
  };

  const updateUser = async (input: UpdateUserInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: UpdateUserDocument,
        variables: { user: input },
      });
      if (data?.updateUser && user.value) {
        user.value = { ...user.value, ...data.updateUser };
      }
      clearNuxtData((k) => k.startsWith('user-'));
      return data?.updateUser;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to update user');
    }
  };

  const updateProfile = async (input: UpdateProfileInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: UpdateProfileDocument,
        variables: { profile: input },
      });
      if (data?.updateProfile && user.value) {
        user.value = {
          ...user.value,
          profile: { ...user.value.profile, ...data.updateProfile },
        };
      }
      clearNuxtData((k) => k.startsWith('user-'));
      return data?.updateProfile;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to update profile');
    }
  };

  const uploadAvatar = async (input: UploadAvatarInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: UploadAvatarDocument,
        variables: { avatar: input },
      });
      if (data?.uploadAvatar && user.value) {
        user.value = {
          ...user.value,
          profile: { ...user.value.profile, avatar: data.uploadAvatar },
        };
      }
      clearNuxtData((k) => k.startsWith('user-'));
      return data?.uploadAvatar;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to upload avatar');
    }
  };

  const deleteAvatar = async (input: DeleteAvatarInput) => {
    try {
      await client!.mutate({
        mutation: DeleteAvatarDocument,
        variables: { avatar: input },
      });
      if (user.value) {
        user.value = {
          ...user.value,
          profile: { ...user.value.profile, avatar: null },
        };
      }
      clearNuxtData((k) => k.startsWith('user-'));
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to delete avatar');
    }
  };

  return {
    user,
    loading,
    error,
    fetchUser,
    fetchDepartments,
    fetchPositions,
    updateUser,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
  };
};
