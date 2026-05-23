// components/ModalWrapper.tsx
import { useModal } from "@/stores/modalStore";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const ModalWrapper = () => {
  const { isVisible, component, closeModal } = useModal();

  if (!component || !isVisible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.centeredView}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeModal}
        />
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          {typeof component === "string" ? (
            <Text>{component}</Text>
          ) : typeof component === "function" ? (
            // component can be a component (function/class) — instantiate it
            React.createElement(component as React.ComponentType)
          ) : (
            // component is assumed to be a React node (children)
            component
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
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
  modalView: {
    width: "80%",
    backgroundColor: "white",
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
    color: "#666",
  },
});
