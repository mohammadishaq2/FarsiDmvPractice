import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppHeader } from "../components/AppHeader";
import { APP_NAME, APP_VERSION } from "../config/appConfig";
import {
  clearSavedQuestions,
  clearTestHistory,
  clearWrongQuestions,
  removeItem,
} from "../utils/storageUtils";

export default function SettingsScreen() {
  const askConfirm = (
    title: string,
    message: string,
    action: () => Promise<void>,
  ) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        style: "destructive",
        onPress: () => {
          void action();
        },
      },
    ]);
  };

  const handleClearSaved = () => {
    askConfirm(
      "Clear Saved Questions",
      "Are you sure you want to remove all saved questions?",
      async () => {
        await clearSavedQuestions();
      },
    );
  };

  const handleClearWrong = () => {
    askConfirm(
      "Clear Wrong Answers",
      "Are you sure you want to remove all wrong answers?",
      async () => {
        await clearWrongQuestions();
      },
    );
  };

  const handleClearHistory = () => {
    askConfirm(
      "Clear Test History",
      "Are you sure you want to remove all test history records?",
      async () => {
        await clearTestHistory();
      },
    );
  };

  const handleClearAll = () => {
    askConfirm(
      "Clear All App Data",
      "This will remove saved questions, wrong answers, and test history. Continue?",
      async () => {
        await Promise.all([
          clearSavedQuestions(),
          clearWrongQuestions(),
          clearTestHistory(),
          // Legacy keys from earlier iterations.
          removeItem("savedQuestionIds"),
          removeItem("wrongAnswerQuestionIds"),
        ]);
      },
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        titleEn="Settings / About"
        titleFa="تنظیمات / درباره"
        subtitleEn="App info, legal note and data controls"
        subtitleFa="اطلاعات برنامه، یادداشت حقوقی و مدیریت داده"
        showBackButton
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.itemCard}>
          <Text style={styles.appName}>{APP_NAME}</Text>
          <Text style={styles.subtitle}>California Permit Test Practice</Text>
          <Text style={styles.version}>Version {APP_VERSION}</Text>
        </View>

        <View style={styles.itemCard}>
          <Text style={styles.itemTitle}>Disclaimer</Text>
          <Text style={styles.paragraph}>
            This app is for educational practice only and is not affiliated
            with, endorsed by, or sponsored by the California DMV.
          </Text>
        </View>

        <View style={styles.itemCard}>
          <Text style={styles.itemTitle}>Data Source</Text>
          <Text style={styles.paragraph}>
            Practice questions are based on the California Driver's Handbook
            quick reference content.
          </Text>
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.itemTitle}>Data Management</Text>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
            onPress={handleClearSaved}
          >
            <Text style={styles.actionText}>Clear Saved Questions</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
            onPress={handleClearWrong}
          >
            <Text style={styles.actionText}>Clear Wrong Answers</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
            onPress={handleClearHistory}
          >
            <Text style={styles.actionText}>Clear Test History</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.dangerButton,
              pressed && styles.pressed,
            ]}
            onPress={handleClearAll}
          >
            <Text style={styles.dangerText}>Clear All App Data</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF5FD",
  },
  content: {
    padding: 16,
    paddingBottom: 28,
    gap: 12,
  },
  itemCard: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
  },
  actionsCard: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
    gap: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#173958",
  },
  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#456683",
    fontWeight: "600",
  },
  version: {
    marginTop: 10,
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#E8F2FF",
    color: "#2A5E90",
    fontSize: 12,
    fontWeight: "700",
  },
  itemTitle: {
    fontSize: 14,
    color: "#4B6986",
    fontWeight: "700",
  },
  paragraph: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: "#3F5D79",
    fontWeight: "500",
  },
  actionButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D3E2F2",
    backgroundColor: "#F7FBFF",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  actionText: {
    color: "#2A567F",
    fontSize: 14,
    fontWeight: "700",
  },
  dangerButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3C3C7",
    backgroundColor: "#FDEDEE",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  dangerText: {
    color: "#A13C45",
    fontSize: 14,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});
