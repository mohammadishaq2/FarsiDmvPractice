import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { AppHeader } from "../components/AppHeader";
import { clearTestHistory, getTestHistory } from "../utils/storageUtils";

type TestResult = {
  id: string;
  createdAt: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  percentage: number;
  passed: boolean;
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return date.toLocaleString();
}

export default function TestHistoryScreen() {
  const [history, setHistory] = useState<TestResult[]>([]);

  const loadHistory = useCallback(async () => {
    const results = await getTestHistory<TestResult>();
    setHistory(results);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
    }, [loadHistory]),
  );

  const sortedHistory = useMemo(
    () =>
      [...history].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [history],
  );

  const handleClearHistory = () => {
    Alert.alert(
      "Clear Test History",
      "Are you sure you want to remove all test history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await clearTestHistory();
            setHistory([]);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        titleEn="Test History"
        titleFa="تاریخچه آزمون ها"
        subtitleEn="See progress and confidence over time"
        subtitleFa="روند پیشرفت و اعتماد به نفس خود را ببینید"
        showBackButton
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Text style={styles.countText}>Tests: {sortedHistory.length}</Text>
          {sortedHistory.length > 0 ? (
            <Pressable
              style={({ pressed }) => [
                styles.clearButton,
                pressed && styles.pressed,
              ]}
              onPress={handleClearHistory}
            >
              <Text style={styles.clearButtonText}>Clear Test History</Text>
            </Pressable>
          ) : null}
        </View>

        {sortedHistory.length === 0 ? (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateIcon}>📈</Text>
            <Text style={styles.emptyStateTitle}>No tests completed yet</Text>
            <Text style={styles.emptyStateDescription}>
              Take a mock test to see your progress here.
            </Text>
          </View>
        ) : (
          <View style={styles.listWrap}>
            {sortedHistory.map((result) => (
              <View key={result.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.dateText}>
                    {formatDateTime(result.createdAt)}
                  </Text>
                  <Text
                    style={[
                      styles.statusBadge,
                      result.passed ? styles.passBadge : styles.failBadge,
                    ]}
                  >
                    {result.passed ? "Passed" : "Failed"}
                  </Text>
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Score</Text>
                    <Text style={styles.metricValue}>{result.percentage}%</Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Correct</Text>
                    <Text style={styles.metricValue}>
                      {result.correctAnswers} / {result.totalQuestions}
                    </Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Wrong</Text>
                    <Text style={styles.metricValue}>
                      {result.wrongAnswers}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
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
    gap: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  countText: {
    fontSize: 14,
    color: "#285075",
    fontWeight: "700",
  },
  clearButton: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#F4C5C5",
    backgroundColor: "#FDECEC",
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#A53D3D",
  },
  listWrap: {
    gap: 11,
  },
  card: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderWidth: 1,
    borderColor: "#D8E7F7",
    shadowColor: "#173958",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    gap: 12,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  dateText: {
    flex: 1,
    color: "#597691",
    fontSize: 12,
    fontWeight: "700",
  },
  statusBadge: {
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "700",
  },
  passBadge: {
    backgroundColor: "#EAF8F0",
    color: "#24754A",
  },
  failBadge: {
    backgroundColor: "#FDECEC",
    color: "#A53D3D",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  metricItem: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#F6FAFF",
    borderWidth: 1,
    borderColor: "#DCE8F5",
    paddingVertical: 10,
    paddingHorizontal: 9,
  },
  metricLabel: {
    fontSize: 11,
    color: "#607C96",
    fontWeight: "700",
  },
  metricValue: {
    marginTop: 4,
    fontSize: 16,
    color: "#16324F",
    fontWeight: "800",
  },
  emptyStateCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D8E7F7",
    shadowColor: "#173958",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    marginTop: 8,
  },
  emptyStateIcon: {
    fontSize: 30,
  },
  emptyStateTitle: {
    marginTop: 8,
    fontSize: 21,
    fontWeight: "800",
    color: "#16324F",
    textAlign: "center",
  },
  emptyStateDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#4C6983",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
