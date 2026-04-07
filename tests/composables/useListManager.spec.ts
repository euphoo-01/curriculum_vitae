import { describe, it, expect } from 'vitest';
import { useListManager } from '../../app/composables/useListManager';

describe('useListManager', () => {
  it('initializes with default values', () => {
    const manager = useListManager('id');
    expect(manager.isAddModalOpen.value).toBe(false);
    expect(manager.isEditModalOpen.value).toBe(false);
    expect(manager.isConfirmModalOpen.value).toBe(false);
    expect(manager.deleteMode.value).toBe(false);
    expect(manager.selectedItem.value).toBeNull();
    expect(manager.selectedItemsToDelete.value.size).toBe(0);
  });

  describe('toggleDeleteMode', () => {
    it('turns on delete mode and clears selection when off', () => {
      const manager = useListManager('id');
      manager.selectedItemsToDelete.value.add('1');
      manager.toggleDeleteMode();
      expect(manager.deleteMode.value).toBe(true);
      expect(manager.selectedItemsToDelete.value.size).toBe(0);
    });

    it('opens confirm modal if items are selected and turning off', () => {
      const manager = useListManager('id');
      manager.deleteMode.value = true;
      manager.selectedItemsToDelete.value.add('1');
      manager.toggleDeleteMode();
      expect(manager.deleteMode.value).toBe(true);
      expect(manager.isConfirmModalOpen.value).toBe(true);
    });

    it('turns off delete mode if no items are selected and turning off', () => {
      const manager = useListManager('id');
      manager.deleteMode.value = true;
      manager.toggleDeleteMode();
      expect(manager.deleteMode.value).toBe(false);
      expect(manager.isConfirmModalOpen.value).toBe(false);
    });
  });

  describe('cancelDeleteMode', () => {
    it('turns off delete mode and clears selection', () => {
      const manager = useListManager('id');
      manager.deleteMode.value = true;
      manager.selectedItemsToDelete.value.add('1');
      manager.cancelDeleteMode();
      expect(manager.deleteMode.value).toBe(false);
      expect(manager.selectedItemsToDelete.value.size).toBe(0);
    });
  });

  describe('handleItemClick', () => {
    it('selects item and opens edit modal if delete mode is off', () => {
      const manager = useListManager<{ id: string; name: string }>('id');
      const item = { id: '1', name: 'Item 1' };
      manager.handleItemClick(item);
      expect(manager.selectedItem.value).toEqual(item);
      expect(manager.isEditModalOpen.value).toBe(true);
    });

    it('adds item to delete selection if delete mode is on', () => {
      const manager = useListManager<{ id: string; name: string }>('id');
      manager.deleteMode.value = true;
      const item = { id: '1', name: 'Item 1' };
      manager.handleItemClick(item);
      expect(manager.selectedItemsToDelete.value.has('1')).toBe(true);
    });

    it('removes item from delete selection if already selected and delete mode is on', () => {
      const manager = useListManager<{ id: string; name: string }>('id');
      manager.deleteMode.value = true;
      manager.selectedItemsToDelete.value.add('1');
      const item = { id: '1', name: 'Item 1' };
      manager.handleItemClick(item);
      expect(manager.selectedItemsToDelete.value.has('1')).toBe(false);
    });
  });

  describe('openDeleteModalFromEdit', () => {
    it('closes edit modal, sets item to delete, and opens confirm modal', () => {
      const manager = useListManager<{ id: string; name: string }>('id');
      manager.isEditModalOpen.value = true;
      manager.selectedItem.value = { id: '1', name: 'Item 1' };
      manager.openDeleteModalFromEdit();
      expect(manager.isEditModalOpen.value).toBe(false);
      expect(manager.selectedItemsToDelete.value.has('1')).toBe(true);
      expect(manager.isConfirmModalOpen.value).toBe(true);
    });

    it('handles case where selectedItem is null', () => {
      const manager = useListManager<{ id: string; name: string }>('id');
      manager.isEditModalOpen.value = true;
      manager.selectedItem.value = null;
      manager.openDeleteModalFromEdit();
      expect(manager.isEditModalOpen.value).toBe(false);
      expect(manager.selectedItemsToDelete.value.size).toBe(0);
      expect(manager.isConfirmModalOpen.value).toBe(true);
    });
  });

  describe('clearSelection', () => {
    it('clears all selections', () => {
      const manager = useListManager<{ id: string; name: string }>('id');
      manager.selectedItem.value = { id: '1', name: 'Item 1' };
      manager.selectedItemsToDelete.value.add('1');
      manager.clearSelection();
      expect(manager.selectedItem.value).toBeNull();
      expect(manager.selectedItemsToDelete.value.size).toBe(0);
    });
  });
});
