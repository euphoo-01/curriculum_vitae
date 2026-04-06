import { ref } from 'vue';

export function useTableManager<TEditData>() {
  const search = ref('');
  const isDeleteModal = ref(false);
  const isAddModal = ref(false);

  const isSnackbar = ref(false);
  const actionMessage = ref('');
  const snackbarColor = ref('error');
  const loadingAction = ref(false);

  const itemToDelete = ref<string | null>(null);
  const itemToEdit = ref<TEditData | null>(null);

  const openAddModal = () => {
    itemToEdit.value = null;
    isAddModal.value = true;
  };

  const openEditModal = (item: TEditData) => {
    itemToEdit.value = item;
    isAddModal.value = true;
  };

  const openDeleteModal = (id: string) => {
    itemToDelete.value = id;
    isDeleteModal.value = true;
  };

  const showSuccess = (message: string) => {
    actionMessage.value = message;
    snackbarColor.value = 'success';
    isSnackbar.value = true;
    isAddModal.value = false;
    isDeleteModal.value = false;
  };

  const showError = (message: string) => {
    actionMessage.value = message;
    snackbarColor.value = 'error';
    isSnackbar.value = true;
  };

  const closeModals = () => {
    isAddModal.value = false;
    isDeleteModal.value = false;
    itemToEdit.value = null;
    itemToDelete.value = null;
  };

  return {
    search,
    isDeleteModal,
    isAddModal,
    isSnackbar,
    actionMessage,
    snackbarColor,
    loadingAction,
    itemToDelete,
    itemToEdit,
    openAddModal,
    openEditModal,
    openDeleteModal,
    showSuccess,
    showError,
    closeModals,
  };
}
