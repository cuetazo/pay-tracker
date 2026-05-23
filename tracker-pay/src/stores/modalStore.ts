import { useRouter } from "expo-router";
import { create } from "zustand";

export type ModalType = "transparent" | "fullscreen";

export interface ModalConfig {
  type?: ModalType;
}

interface ModalState {
  component: React.ReactNode | null;
  isVisible: boolean;
  config: ModalConfig;
  openModal: (content: React.ReactNode, config?: ModalConfig) => void;
  closeModal: () => void;
}

export const useModal = create<ModalState>((set) => ({
  component: null,
  isVisible: false,
  config: { type: "transparent" },
  openModal: (content, config = { type: "transparent" }) =>
    set({ isVisible: true, component: content, config }),
  closeModal: () => set({ isVisible: false, component: null }),
}));

// Hook to use modal navigation
export const useModalNavigation = () => {
  const router = useRouter();
  const { openModal: openModalStore, closeModal: closeModalStore } = useModal();

  return {
    openModal: (content: string | React.ReactNode, config?: ModalConfig) => {
      if (typeof content === "string") {
        // Es una ruta del router - usar navigate con cast para evitar validación de tipos
        router.navigate(`/modal/${content}` as any);
      } else {
        // Es un componente React
        openModalStore(content, config);
      }
    },
    closeModal: () => {
      closeModalStore();
      router.back();
    },
  };
};
