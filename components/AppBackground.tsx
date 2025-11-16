import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleSheet } from "react-native";

interface AppBackgroundProps {
  children: ReactNode;
}

export default function AppBackground({ children }: AppBackgroundProps) {
  return (
    <LinearGradient
      colors={[
        "#2E3440",
        "#2C3240",
        "#2A3040",
        "#282E40",
        "#262C40",
        "#252B3E",
        "#24293C",
        "#23283A",
        "#222638",
      ]}
      locations={[0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1]}
      style={styles.container}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
