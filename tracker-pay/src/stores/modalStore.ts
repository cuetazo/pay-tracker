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
  // Tracks whether the modal was opened with a route (string) or a component
  isRouteModal: boolean;
  openModal: (content: React.ReactNode, config?: ModalConfig) => void;
  closeModal: () => void;
  _openRouteModal: () => void;
}

export const useModal = create<ModalState>((set) => ({
  component: null,
  isVisible: false,
  config: { type: "transparent" },
  isRouteModal: false,
  openModal: (content, config = { type: "transparent" }) =>
    set({ isVisible: true, component: content, config, isRouteModal: false }),
  closeModal: () =>
    set({ isVisible: false, component: null, isRouteModal: false }),
  _openRouteModal: () => set({ isRouteModal: true }),
}));

// Hook to use modal navigation
export const useModalNavigation = () => {
  const router = useRouter();
  const {
    openModal: openModalStore,
    closeModal: closeModalStore,
    _openRouteModal,
    isRouteModal,
  } = useModal();

  return {
    openModal: (content: string | React.ReactNode, config?: ModalConfig) => {
      if (typeof content === "string") {
        // Route-based modal → navigate and mark as route modal
        _openRouteModal();
        router.navigate(`/modal/${content}` as any);
      } else {
        // Component modal → store only, no navigation
        openModalStore(content, config);
      }
    },
    closeModal: () => {
      if (isRouteModal) {
        // Route modal → need router.back() to dismiss the route
        closeModalStore();
        router.back();
      } else {
        // Component modal → just clear the store, no navigation
        closeModalStore();
      }
    },
  };
};
