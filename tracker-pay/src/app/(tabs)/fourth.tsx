import { useModalNavigation } from "@/stores/modalStore";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FourthScreen() {
  const { openModal } = useModalNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{
          padding: 10,
          backgroundColor: "lightblue",
          borderRadius: 5,
          marginBottom: 20,
        }}
        onPress={() =>
          openModal(<Text>This is the Transactions modal content.</Text>)
        }
      >
        <Text>Open Transactions Modal</Text>
      </TouchableOpacity>
      <Text>This is the fourth screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
});
