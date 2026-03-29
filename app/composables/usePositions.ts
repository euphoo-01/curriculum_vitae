import {
  GetPositionsDocument,
  CreatePositionDocument,
  UpdatePositionDocument,
  DeletePositionDocument,
} from '../../graphql/generated/graphql';
import type {
  GetPositionsQuery,
  CreatePositionInput,
  UpdatePositionInput,
} from '../../graphql/generated/graphql';

export const usePositions = () => {
  const { clients } = useApollo();
  const client = clients?.default;

  const positions = ref<GetPositionsQuery['positions']>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const fetchPositions = async () => {
    loading.value = true;
    error.value = null;

    const { data: fetchedData, error: fetchError } = await useAsyncData(
      'positions',
      async () => {
        const { data } = await client!.query({
          query: GetPositionsDocument,
          fetchPolicy: 'network-only',
        });
        return data.positions;
      }
    );

    if (fetchError.value) {
      error.value =
        fetchError.value instanceof Error
          ? fetchError.value
          : new Error('Failed to fetch positions');
    } else if (fetchedData.value) {
      positions.value = fetchedData.value;
    }

    loading.value = false;
  };

  const createPosition = async (position: CreatePositionInput) => {
    error.value = null;
    try {
      await client!.mutate({
        mutation: CreatePositionDocument,
        variables: { position },
      });
      clearNuxtData('positions');
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
      await client!.mutate({
        mutation: UpdatePositionDocument,
        variables: { position },
      });
      clearNuxtData('positions');
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
      await client!.mutate({
        mutation: DeletePositionDocument,
        variables: { positionId },
      });
      clearNuxtData('positions');
      await fetchPositions();
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to delete position');
      throw e;
    }
  };

  return {
    positions,
    loading,
    error,
    fetchPositions,
    createPosition,
    updatePosition,
    deletePosition,
  };
};
