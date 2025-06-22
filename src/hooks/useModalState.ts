import { useState } from 'react';

interface ModalState<T = any> {
  isOpen: boolean;
  isViewMode: boolean;
  selectedItem: T | null;
}

interface UseModalStateReturn<T> {
  modalState: ModalState<T>;
  openModal: (item?: T, isViewMode?: boolean) => void;
  closeModal: () => void;
  switchToEditMode: () => void;
  setSelectedItem: (item: T | null) => void;
}

export function useModalState<T = any>(
  initialState: ModalState<T> = {
    isOpen: false,
    isViewMode: false,
    selectedItem: null
  }
): UseModalStateReturn<T> {
  const [modalState, setModalState] = useState<ModalState<T>>(initialState);

  const openModal = (item?: T, isViewMode: boolean = false) => {
    setModalState({
      isOpen: true,
      isViewMode,
      selectedItem: item || null
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      isViewMode: false,
      selectedItem: null
    });
  };

  const switchToEditMode = () => {
    setModalState(prev => ({
      ...prev,
      isViewMode: false
    }));
  };

  const setSelectedItem = (item: T | null) => {
    setModalState(prev => ({
      ...prev,
      selectedItem: item
    }));
  };

  return {
    modalState,
    openModal,
    closeModal,
    switchToEditMode,
    setSelectedItem
  };
} 