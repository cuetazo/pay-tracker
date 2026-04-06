import { Text, View } from "react-native";

export default function OnBoardingScreen() {
  //invocar funcion del store para sacarlo
  return (
    <View>
      <Text>wasa screen</Text>
      {/* el backend sufrira luego, un momento yo soy el backend */}
      <Text>
        Ingresa tu presupuesto semanal/mensual/anual (por defecto mensual )
      </Text>
    </View>
  );
}
