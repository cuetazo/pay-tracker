import { useModalNavigation } from "@/stores/modalStore";

export const useModal = () => {
  const { openModal, closeModal } = useModalNavigation();

  return {
    openModal,
    closeModal,
    openWithDelay: (content: string | React.ReactNode, delay: number = 300) => {
      setTimeout(() => openModal(content), delay);
    },
  };
};
