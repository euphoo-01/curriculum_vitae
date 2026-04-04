import { defineStore } from 'pinia';
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

export const usePositionsStore = defineStore('positions', () => {
  const { clients } = useApollo();
  const client = clients?.default;

  const positions = ref<GetPositionsQuery['positions']>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const fetchPositions = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await client!.query({
        query: GetPositionsDocument,
        fetchPolicy: 'network-only',
      });
      positions.value = data.positions;
    } catch (e) {
      error.value =
        e instanceof Error ? e : new Error('Failed to fetch positions');
    } finally {
      loading.value = false;
    }
  };

  const createPosition = async (position: CreatePositionInput) => {
    error.value = null;
    try {
      await client!.mutate({
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
      await client!.mutate({
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
      await client!.mutate({
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

  return {
    positions,
    loading,
    error,
    fetchPositions,
    createPosition,
    updatePosition,
    deletePosition,
  };
});
