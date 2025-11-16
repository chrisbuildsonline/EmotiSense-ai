import AppBackground from "@/components/AppBackground";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function SettingsScreen() {
  return (
    <AppBackground>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="settings" size={60} color="#4A90E2" />
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Configure MotionAI</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About MotionAI</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Ionicons name="information-circle-outline" size={24} color="#4A90E2" />
              <Text style={styles.settingTitle}>Version</Text>
            </View>
            <Text style={styles.settingDescription}>
              MotionAI v1.0.0
            </Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#4CAF50" />
              <Text style={styles.settingTitle}>Privacy</Text>
            </View>
            <Text style={styles.settingDescription}>
              All emotion detection runs on-device. No data is collected or transmitted.
            </Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Ionicons name="happy-outline" size={24} color="#FF9800" />
              <Text style={styles.settingTitle}>Emotion Detection</Text>
            </View>
            <Text style={styles.settingDescription}>
              Real-time analysis of facial expressions to detect happy, sad, excited, and neutral emotions.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>Real-time emotion tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>Smile intensity measurement</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>Energy level analysis</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>Head movement tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>Session statistics</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>100% offline processing</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "Playfair-Bold",
    color: "#FFFFFF",
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: "#9bb2c974",
    marginTop: 5,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
    letterSpacing: 1,
  },
  settingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
  },
  settingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 12,
  },
  settingDescription: {
    fontSize: 14,
    color: "#9bb2c974",
    lineHeight: 20,
  },
  featureList: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 12,
  },
});
