import { useRouter } from "expo-router";
import { create } from "zustand";

interface ModalState {
  component: React.ReactNode | null;
  isVisible: boolean;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
}

export const useModal = create<ModalState>((set) => ({
  component: null,
  isVisible: false,
  openModal: (content) => set({ isVisible: true, component: content }),
  closeModal: () => set({ isVisible: false, component: null }),
}));

// Hook to use modal navigation
export const useModalNavigation = () => {
  const router = useRouter();
  const { openModal: openModalStore, closeModal: closeModalStore } = useModal();

  return {
    openModal: (content: string | React.ReactNode) => {
      if (typeof content === "string") {
        // Es una ruta del router - usar navigate con cast para evitar validación de tipos
        router.navigate(`/modal/${content}` as any);
      } else {
        // Es un componente React
        openModalStore(content);
      }
    },
    closeModal: () => {
      closeModalStore();
      router.back();
    },
  };
};
