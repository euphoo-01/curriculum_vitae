import { describe, it, expect } from 'vitest';
import { useTableManager } from '../../app/composables/useTableManager';

describe('useTableManager', () => {
  it('initializes with default values', () => {
    const manager = useTableManager();
    expect(manager.search.value).toBe('');
    expect(manager.isDeleteModal.value).toBe(false);
    expect(manager.isAddModal.value).toBe(false);
    expect(manager.isSnackbar.value).toBe(false);
    expect(manager.actionMessage.value).toBe('');
    expect(manager.snackbarColor.value).toBe('error');
    expect(manager.loadingAction.value).toBe(false);
    expect(manager.itemToDelete.value).toBeNull();
    expect(manager.itemToEdit.value).toBeNull();
  });

  it('openAddModal clears itemToEdit and opens add modal', () => {
    const manager = useTableManager<{ id: string }>();
    manager.itemToEdit.value = { id: '1' };
    manager.openAddModal();

    expect(manager.itemToEdit.value).toBeNull();
    expect(manager.isAddModal.value).toBe(true);
  });

  it('openEditModal sets itemToEdit and opens add modal', () => {
    const manager = useTableManager<{ id: string }>();
    const item = { id: '123' };
    manager.openEditModal(item);

    expect(manager.itemToEdit.value).toEqual(item);
    expect(manager.isAddModal.value).toBe(true);
  });

  it('openDeleteModal sets itemToDelete and opens delete modal', () => {
    const manager = useTableManager();
    manager.openDeleteModal('456');

    expect(manager.itemToDelete.value).toBe('456');
    expect(manager.isDeleteModal.value).toBe(true);
  });

  it('showSuccess sets success state and closes modals', () => {
    const manager = useTableManager();
    manager.isAddModal.value = true;
    manager.isDeleteModal.value = true;

    manager.showSuccess('Operation successful!');

    expect(manager.actionMessage.value).toBe('Operation successful!');
    expect(manager.snackbarColor.value).toBe('success');
    expect(manager.isSnackbar.value).toBe(true);
    expect(manager.isAddModal.value).toBe(false);
    expect(manager.isDeleteModal.value).toBe(false);
  });

  it('showError sets error state', () => {
    const manager = useTableManager();

    manager.showError('Operation failed!');

    expect(manager.actionMessage.value).toBe('Operation failed!');
    expect(manager.snackbarColor.value).toBe('error');
    expect(manager.isSnackbar.value).toBe(true);
  });

  it('closeModals resets modal and item states', () => {
    const manager = useTableManager<{ id: string }>();
    manager.isAddModal.value = true;
    manager.isDeleteModal.value = true;
    manager.itemToEdit.value = { id: '1' };
    manager.itemToDelete.value = '2';

    manager.closeModals();

    expect(manager.isAddModal.value).toBe(false);
    expect(manager.isDeleteModal.value).toBe(false);
    expect(manager.itemToEdit.value).toBeNull();
    expect(manager.itemToDelete.value).toBeNull();
  });
});
