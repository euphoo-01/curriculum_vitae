import { ref } from 'vue';

export function useListManager<T extends Record<string, unknown>>(
  idKey: keyof T
) {
  const isAddModalOpen = ref(false);
  const isEditModalOpen = ref(false);
  const isConfirmModalOpen = ref(false);
  const deleteMode = ref(false);

  const selectedItem = ref<T | null>(null);
  const selectedItemsToDelete = ref<Set<string | number>>(new Set());

  const toggleDeleteMode = () => {
    if (!deleteMode.value) {
      deleteMode.value = true;
      selectedItemsToDelete.value.clear();
    } else {
      if (selectedItemsToDelete.value.size > 0) {
        isConfirmModalOpen.value = true;
      } else {
        deleteMode.value = false;
      }
    }
  };

  const cancelDeleteMode = () => {
    deleteMode.value = false;
    selectedItemsToDelete.value.clear();
  };

  const handleItemClick = (item: T) => {
    const id = item[idKey] as unknown as string | number;
    if (deleteMode.value) {
      if (selectedItemsToDelete.value.has(id)) {
        selectedItemsToDelete.value.delete(id);
      } else {
        selectedItemsToDelete.value.add(id);
      }
    } else {
      selectedItem.value = { ...item };
      isEditModalOpen.value = true;
    }
  };

  const openDeleteModalFromEdit = () => {
    isEditModalOpen.value = false;
    selectedItemsToDelete.value.clear();
    if (selectedItem.value) {
      selectedItemsToDelete.value.add(
        selectedItem.value[idKey] as unknown as string | number
      );
    }
    isConfirmModalOpen.value = true;
  };

  const clearSelection = () => {
    selectedItemsToDelete.value.clear();
    selectedItem.value = null;
  };

  return {
    isAddModalOpen,
    isEditModalOpen,
    isConfirmModalOpen,
    deleteMode,
    selectedItem,
    selectedItemsToDelete,
    toggleDeleteMode,
    cancelDeleteMode,
    handleItemClick,
    openDeleteModalFromEdit,
    clearSelection,
  };
}
