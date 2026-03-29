import {
  GetCvsDocument,
  CreateCvDocument,
  UpdateCvDocument,
  DeleteCvDocument,
} from '../../graphql/generated/graphql';
import type {
  GetCvsQuery,
  CreateCvInput,
  UpdateCvInput,
  DeleteCvInput,
} from '../../graphql/generated/graphql';

export const useCvs = () => {
  const { clients } = useApollo();
  const client = clients?.default;

  const cvs = ref<GetCvsQuery['user']['cvs']>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const fetchCvs = async (userId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await client!.query({
        query: GetCvsDocument,
        variables: { userId },
        fetchPolicy: 'network-only',
      });
      cvs.value = data.user?.cvs || [];
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to fetch CVs');
    } finally {
      loading.value = false;
    }
  };

  const createCv = async (input: CreateCvInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: CreateCvDocument,
        variables: { cv: input },
      });
      return data?.createCv;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to create CV');
    }
  };

  const updateCv = async (input: UpdateCvInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: UpdateCvDocument,
        variables: { cv: input },
      });
      return data?.updateCv;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to update CV');
    }
  };

  const deleteCv = async (input: DeleteCvInput) => {
    try {
      const { data } = await client!.mutate({
        mutation: DeleteCvDocument,
        variables: { cv: input },
      });
      return data?.deleteCv;
    } catch (e) {
      throw e instanceof Error ? e : new Error('Failed to delete CV');
    }
  };

  return {
    cvs,
    loading,
    error,
    fetchCvs,
    createCv,
    updateCv,
    deleteCv,
  };
};
