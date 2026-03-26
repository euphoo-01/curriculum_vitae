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
    try {
      const { data } = await client!.query({
        query: GetUserDocument,
        variables: { userId },
        fetchPolicy: 'network-only',
      });
      user.value = data.user;
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to fetch user profile');
    } finally {
      loading.value = false;
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await client!.query({
        query: GetDepartmentsDocument,
      });
      return data.departments;
    } catch (e) {
      console.error('Failed to fetch departments', e);
      return [];
    }
  };

  const fetchPositions = async () => {
    try {
      const { data } = await client!.query({
        query: GetPositionsDocument,
      });
      return data.positions;
    } catch (e) {
      console.error('Failed to fetch positions', e);
      return [];
    }
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
