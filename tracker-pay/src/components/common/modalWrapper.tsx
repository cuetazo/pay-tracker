// components/ModalWrapper.tsx
import { Colors } from "@/constants/theme";
import { useAppColors } from "@/hooks/useAppColors";
import { useModal } from "@/stores/modalStore";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const ModalWrapper = () => {
  const { isVisible, component, closeModal, config } = useModal();
  const c = useAppColors();

  if (!component || !isVisible) return null;

  const modalType = config.type || "transparent";

  // Renderizar componente
  const renderComponent = () => {
    if (typeof component === "string") {
      return <Text>{component}</Text>;
    } else if (typeof component === "function") {
      return React.createElement(component as React.ComponentType);
    } else {
      return component;
    }
  };

  const cardBg =
    c.neutral.white === "#0F172A" ? "#1E293B" : Colors.neutral.white;
  const fullscreenBg = c.primary.background;

  // Modal transparente (centrado, pequeño)
  if (modalType === "transparent") {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.transparentContainer}>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={closeModal}
          />
          <View style={[styles.transparentView, { backgroundColor: cardBg }]}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={[styles.closeText, { color: c.neutral.gray400 }]}>✕</Text>
            </TouchableOpacity>
            {renderComponent()}
          </View>
        </View>
      </Modal>
    );
  }

  // Modal fullscreen (como pageSheet)
  if (modalType === "fullscreen") {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={isVisible}
        onRequestClose={closeModal}
      >
        <View style={[styles.fullscreenContainer, { backgroundColor: fullscreenBg }]}>
          {renderComponent()}
        </View>
      </Modal>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  // ─── Transparent Modal ──────────────────────────────────────────
  transparentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  transparentView: {
    width: "80%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 5,
    zIndex: 1,
  },
  closeText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  // ─── Fullscreen Modal ───────────────────────────────────────────
  fullscreenContainer: {
    flex: 1,
  },
});
