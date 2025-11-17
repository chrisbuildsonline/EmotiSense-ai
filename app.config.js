import 'dotenv/config';

export default {
  expo: {
    name: "EmotiSense AI",
    slug: "emotisense-ai",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "emotisense",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "$(PRODUCT_NAME) needs camera access to analyze your emotions and motion patterns.",
        ITSAppUsesNonExemptEncryption: false
      },
      bundleIdentifier: process.env.IOS_BUNDLE_ID || "com.yourcompany.emotisense"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "android.permission.CAMERA",
        "android.permission.WRITE_SETTINGS"
      ],
      package: process.env.ANDROID_PACKAGE || "com.yourcompany.emotisense"
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "react-native-vision-camera",
        {
          cameraPermissionText: "$(PRODUCT_NAME) needs camera access to analyze your emotions and motion patterns.",
          enableMicrophonePermission: false
        }
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ],
      [
        "expo-build-properties",
        {
          ios: {
            deploymentTarget: "16.0"
          }
        }
      ],
      "expo-audio",
      "expo-brightness"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      router: {},
      eas: {
        projectId: process.env.EAS_PROJECT_ID || "f02662e4-e155-4565-bc26-680a1a09a373"
      }
    }
  }
};
