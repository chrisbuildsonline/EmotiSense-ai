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
        "#020508",
        "#040710",
        "#060B1A",
        "#080D20",
        "#0A0E27",
        "#0B1629",
        "#0C1E2F",
        "#0D2635",
        "#0D2A3A",
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
