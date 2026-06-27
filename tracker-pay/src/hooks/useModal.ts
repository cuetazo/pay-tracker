import { useModalNavigation, type ModalConfig } from "@/stores/modalStore";

export const useModal = () => {
  const { openModal, closeModal } = useModalNavigation();

  return {
    openModal,
    closeModal,
    openWithDelay: (
      content: string | React.ReactNode,
      delay: number = 300,
      config?: ModalConfig,
    ) => {
      setTimeout(() => openModal(content, config), delay);
    },
  };
};
