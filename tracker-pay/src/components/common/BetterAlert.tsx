import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomAlert from "./CustomAlert";
import useAlert from "./useAlert";

export default function App() {
  const { alertProps, showAlert } = useAlert();

  return (
    <View style={styles.container}>
      {/* Alerta simple de información */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#3498db" }]}
        onPress={() =>
          showAlert({
            title: "Información",
            message: "Este es un mensaje informativo.",
            type: "info",
          })
        }
      >
        <Text style={styles.text}>Info</Text>
      </TouchableOpacity>

      {/* Alerta de éxito */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#27ae60" }]}
        onPress={() =>
          showAlert({
            title: "¡Éxito!",
            message: "La operación se completó correctamente.",
            type: "success",
          })
        }
      >
        <Text style={styles.text}>Éxito</Text>
      </TouchableOpacity>

      {/* Alerta de advertencia */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#f39c12" }]}
        onPress={() =>
          showAlert({
            title: "Advertencia",
            message: "Esta acción podría tener consecuencias.",
            type: "warning",
          })
        }
      >
        <Text style={styles.text}>Advertencia</Text>
      </TouchableOpacity>

      {/* Alerta de peligro */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#DD6B55" }]}
        onPress={() =>
          showAlert({
            title: "Error",
            message: "Ocurrió un error inesperado.",
            type: "danger",
          })
        }
      >
        <Text style={styles.text}>Peligro</Text>
      </TouchableOpacity>

      {/* Alerta de confirmación con callbacks */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#8e44ad" }]}
        onPress={() =>
          showAlert({
            title: "Confirmar eliminación",
            message: "¿Estás seguro de que deseas eliminar este elemento?",
            type: "confirm",
            showCancel: true,
            confirmText: "Sí, eliminar",
            cancelText: "Cancelar",
            onConfirm: () => console.log("Elemento eliminado"),
            onCancel: () => console.log("Cancelado"),
          })
        }
      >
        <Text style={styles.text}>Confirmar</Text>
      </TouchableOpacity>

      {/* Componente CustomAlert conectado al hook */}
      <CustomAlert {...alertProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    gap: 12,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 160,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
