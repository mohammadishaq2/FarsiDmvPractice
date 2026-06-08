import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BilingualText } from "../components/BilingualText";
import { colors, shadows, spacing, typography } from "../constants/theme";
import { getAllQuestions } from "../utils/questionUtils";
import {
  getSavedQuestionIds,
  getTestHistory,
  getWrongQuestionIds,
} from "../utils/storageUtils";

type ActionButton = {
  enTitle: string;
  faTitle: string;
  enSubtitle: string;
  faSubtitle: string;
  route:
    | "/practice"
    | "/mock-test"
    | "/road-signs"
    | "/saved"
    | "/wrong-answers"
    | "/test-history";
  icon: string;
  iconColor: string;
  iconBackground: string;
};

const ACTION_BUTTONS: ActionButton[] = [
  {
    enTitle: "Start Practice",
    faTitle: "شروع تمرین",
    enSubtitle: "Daily mixed quiz",
    faSubtitle: "تمرین روزانه با سوالات متنوع",
    route: "/practice",
    icon: "📝",
    iconColor: "#0E63A9",
    iconBackground: "#DFEEFF",
  },
  {
    enTitle: "Mock Test",
    faTitle: "آزمون های شبیه سازی شده",
    enSubtitle: "Exam simulation",
    faSubtitle: "شبیه سازی آزمون واقعی",
    route: "/mock-test",
    icon: "⏱️",
    iconColor: "#8B5A1C",
    iconBackground: "#FDF0DD",
  },
  {
    enTitle: "Road Signs",
    faTitle: "تابلوهای راهنمایی",
    enSubtitle: "Visual sign training",
    faSubtitle: "تمرین تصویری تابلوها",
    route: "/road-signs",
    icon: "🚦",
    iconColor: "#1E7C4D",
    iconBackground: "#E4F6EC",
  },
  {
    enTitle: "Saved / Review Later",
    faTitle: "ذخیره\u200cشده / مرور بعدی",
    enSubtitle: "Bookmarks and flags",
    faSubtitle: "سوالات نشان\u200cشده برای مرور",
    route: "/saved",
    icon: "🔖",
    iconColor: "#7A3BA2",
    iconBackground: "#F2E8FA",
  },
  {
    enTitle: "Wrong Answers",
    faTitle: "پاسخ\u200cهای اشتباه",
    enSubtitle: "Fix weak points",
    faSubtitle: "تقویت نقاط ضعف",
    route: "/wrong-answers",
    icon: "❌",
    iconColor: "#B03232",
    iconBackground: "#FCE8E8",
  },
  {
    enTitle: "Test History",
    faTitle: "تاریخچه آزمون\u200cها",
    enSubtitle: "Progress over time",
    faSubtitle: "پیشرفت شما در طول زمان",
    route: "/test-history",
    icon: "📈",
    iconColor: "#2849A3",
    iconBackground: "#E8EEFF",
  },
];

const ui = {
  primary: colors.primary ?? "#2563EB",
  secondary: "#06B6D4",
  success: colors.success ?? "#22C55E",
  warning: colors.warning ?? "#F59E0B",
  danger: colors.error ?? "#EF4444",
  background: colors.background ?? "#F4F8FF",
  card: colors.card ?? "#FFFFFF",
  text: colors.textPrimary ?? "#132B46",
  mutedText: colors.textSecondary ?? "#5F7896",
};

export default function HomeScreen() {
  const router = useRouter();
  const totalQuestions = useMemo(() => getAllQuestions().length, []);

  const [savedQuestionsCount, setSavedQuestionsCount] = useState(0);
  const [wrongAnswersCount, setWrongAnswersCount] = useState(0);
  const [testsCompletedCount, setTestsCompletedCount] = useState(0);

  useEffect(() => {
    async function loadDashboardMetrics() {
      const saved = await getSavedQuestionIds();
      const wrong = await getWrongQuestionIds();
      const tests = await getTestHistory<Array<{ id: string }>>();

      setSavedQuestionsCount(saved.length);
      setWrongAnswersCount(wrong.length);
      setTestsCompletedCount(tests.length);
    }

    void loadDashboardMetrics();
  }, []);

  const stats = [
    {
      key: "total",
      en: "Total Questions",
      fa: "تمام سوالات",
      value: totalQuestions,
      icon: "📚",
      bg: "#EAF2FF",
    },
    {
      key: "saved",
      en: "Saved Questions",
      fa: "سوالات ذخیره شده",
      value: savedQuestionsCount,
      icon: "🔖",
      bg: "#F1ECFF",
    },
    {
      key: "wrong",
      en: "Wrong Answers",
      fa: "پاسخ های اشتباه",
      value: wrongAnswersCount,
      icon: "⚡",
      bg: "#FFEFF0",
    },
    {
      key: "tests",
      en: "Tests Completed",
      fa: "آزمون های تکمیل شده",
      value: testsCompletedCount,
      icon: "🏆",
      bg: "#EAF9EF",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient
        colors={["#EAF2FF", "#E8EEFF", "#ECFAFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      />
      <View style={styles.backgroundCircleOne} />
      <View style={styles.backgroundCircleTwo} />
      <View style={styles.backgroundCircleThree} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#1F68E6", "#3D7CF2", "#22B9D8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.heroTopLeftRow}>
              <View style={styles.heroIconWrap}>
                <Text style={styles.heroTopIcon}>🚗</Text>
              </View>
              <View style={styles.flagBadge}>
                <Text style={styles.flagEmoji}>🇺🇸</Text>
                <Text style={styles.flagText}>CA</Text>
              </View>
            </View>
            <View style={styles.heroIllustration}>
              <View style={styles.heroSignBadge}>
                <Text style={styles.heroBadgeIcon}>🚦</Text>
              </View>
              <View style={styles.heroRoadLine} />
            </View>
          </View>

          <View style={styles.heroTextWrap}>
            <Text style={styles.titleEn}>Farsi DMV Practice</Text>

            <BilingualText
              en="California Permit Test in English & Farsi"
              fa="آزمون مجوز رانندگی کالیفرنیا به انگلیسی و فارسی"
              enStyle={styles.subtitleEn}
              faStyle={styles.subtitleFa}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.heroPrimaryCta,
              pressed && styles.actionCardPressed,
            ]}
            onPress={() => router.push("/practice")}
          >
            <View>
              <BilingualText
                en="Start Practice"
                fa="شروع تمرین"
                enStyle={styles.heroCtaEn}
                faStyle={styles.heroCtaFa}
              />
            </View>
            <Text style={styles.heroCtaArrow}>➜</Text>
          </Pressable>
        </LinearGradient>

        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View
              key={stat.key}
              style={[styles.statsCard, { backgroundColor: stat.bg }]}
            >
              <View style={styles.statsCardTop}>
                <View style={styles.statsIconWrap}>
                  <Text style={styles.statsIconText}>{stat.icon}</Text>
                </View>
                <BilingualText
                  en={stat.en}
                  fa={stat.fa}
                  enStyle={styles.statsLabelEn}
                  faStyle={styles.statsLabelFa}
                />
              </View>
              <Text style={styles.statsValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <View>
            <BilingualText
              en="Main Actions"
              fa="گزینه های اصلی"
              enStyle={styles.sectionTitleEn}
              faStyle={styles.sectionTitleFa}
            />
          </View>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeSparkle}>✨</Text>
            <Text style={styles.sectionBadgeText}>Smart Learning</Text>
          </View>
        </View>

        <View style={styles.actionList}>
          {ACTION_BUTTONS.map((action) => (
            <Pressable
              key={action.route}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
              onPress={() => router.push(action.route as never)}
            >
              <View
                style={[
                  styles.actionIconWrap,
                  { backgroundColor: action.iconBackground },
                ]}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </View>

              <View style={styles.actionTextWrap}>
                <BilingualText
                  en={action.enTitle}
                  fa={action.faTitle}
                  enStyle={styles.actionTitleEn}
                  faStyle={styles.actionTitleFa}
                />
                <BilingualText
                  en={action.enSubtitle}
                  fa={action.faSubtitle}
                  enStyle={styles.actionSubtitleEn}
                  faStyle={styles.actionSubtitleFa}
                />
              </View>

              <View style={styles.chevronWrap}>
                <Text style={styles.actionTrailingIcon}>{action.icon}</Text>
                <Text style={styles.actionChevron}>›</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.disclaimerCard}>
          <BilingualText
            en="This app is for practice only and is not affiliated with the DMV."
            fa="این برنامه فقط برای تمرین است و وابسته به دی ام وی نیست."
            enStyle={styles.disclaimerEn}
            faStyle={styles.disclaimerFa}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ui.background,
  },
  gradientBg: {
    ...StyleSheet.absoluteFill,
  },
  backgroundCircleOne: {
    position: "absolute",
    top: -70,
    right: -30,
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: "#D8E8FF",
    opacity: 0.9,
  },
  backgroundCircleTwo: {
    position: "absolute",
    top: 260,
    left: -55,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: "#DCF6FF",
    opacity: 0.8,
  },
  backgroundCircleThree: {
    position: "absolute",
    bottom: 120,
    right: -45,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: "#E9E7FF",
    opacity: 0.72,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 34,
    gap: 14,
  },
  heroCard: {
    borderRadius: 26,
    padding: 18,
    ...shadows.card,
    gap: 10,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTopLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#E5F0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  flagBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EAF3FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D5E6FB",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  flagEmoji: {
    fontSize: 14,
  },
  flagText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2A5B97",
    letterSpacing: 0.3,
  },
  heroTopIcon: {
    fontSize: 18,
  },
  heroIllustration: {
    width: 84,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#E7F7FF",
    borderWidth: 1,
    borderColor: "#CFEAFF",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  heroSignBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#D8EDFF",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBadgeIcon: {
    fontSize: 15,
  },
  heroRoadLine: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 7,
    height: 5,
    borderRadius: 4,
    backgroundColor: "#B6D8F8",
  },
  heroTextWrap: {
    gap: 2,
  },
  titleEn: {
    ...typography.title,
    color: "#FFFFFF",
    fontSize: 31,
    lineHeight: 36,
    letterSpacing: 0.2,
  },
  titleFa: {
    marginTop: 0,
    fontSize: 14,
    lineHeight: 24,
    color: "#D9EEFF",
    fontWeight: "700",
    fontFamily: "sans-serif",
    textAlign: "right",
    writingDirection: "rtl",
  },
  subtitleEn: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 20,
    color: "#E9F5FF",
    fontWeight: "700",
  },
  subtitleFa: {
    marginTop: 2,
    fontSize: 18,
    lineHeight: 23,
    color: "#DBEEFF",
    fontWeight: "600",
    fontFamily: "sans-serif",
  },
  heroPrimaryCta: {
    marginTop: 6,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7E8FF",
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroCtaEn: {
    fontSize: 15,
    fontWeight: "800",
    color: "#174A97",
  },
  heroCtaFa: {
    fontSize: 14,
    lineHeight: 19,
    color: "#2C659F",
    fontWeight: "700",
  },
  heroCtaArrow: {
    fontSize: 22,
    color: "#1D5FD0",
    fontWeight: "800",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statsCard: {
    flexBasis: "48%",
    flexGrow: 1,
    borderRadius: 20,
    minHeight: 112,
    paddingVertical: 12,
    paddingHorizontal: 12,
    ...shadows.card,
  },
  statsCardTop: {
    gap: 8,
  },
  statsIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsIconText: {
    fontSize: 15,
  },
  statsLabelEn: {
    fontSize: 11,
    color: "#456A91",
    fontWeight: "700",
  },
  statsLabelFa: {
    marginTop: 1,
    fontSize: 14,
    lineHeight: 19,
    color: "#496F95",
    fontWeight: "600",
    fontFamily: "sans-serif",
  },
  statsValue: {
    marginTop: 7,
    fontSize: 30,
    fontWeight: "800",
    color: ui.text,
  },
  sectionHeaderRow: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
  },
  sectionTitleEn: {
    marginTop: 0,
    fontSize: 18,
    fontWeight: "800",
    color: ui.text,
  },
  sectionTitleFa: {
    fontSize: 15,
    lineHeight: 20,
    color: ui.mutedText,
    fontWeight: "700",
    fontFamily: "sans-serif",
  },
  sectionBadge: {
    borderRadius: 999,
    backgroundColor: "#E8F2FF",
    borderWidth: 1,
    borderColor: "#D0E2F7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionBadgeSparkle: {
    fontSize: 13,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4C6E93",
  },
  actionList: {
    gap: 10,
  },
  actionCard: {
    borderRadius: 22,
    backgroundColor: ui.card,
    paddingVertical: 13,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.card,
  },
  actionCardPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    fontSize: 20,
  },
  actionTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitleEn: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A3652",
  },
  actionTitleFa: {
    marginTop: 1,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: "700",
    color: "#315170",
    fontFamily: "sans-serif",
  },
  actionSubtitleEn: {
    marginTop: 2,
    fontSize: 12,
    color: "#5D7894",
    fontWeight: "700",
  },
  actionSubtitleFa: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6A839B",
    fontWeight: "600",
    fontFamily: "sans-serif",
  },
  chevronWrap: {
    marginLeft: 10,
    borderRadius: 12,
    backgroundColor: "#F5FAFF",
    borderWidth: 1,
    borderColor: "#DCEAF7",
    paddingVertical: 7,
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  actionTrailingIcon: {
    fontSize: 14,
  },
  actionChevron: {
    fontSize: 18,
    color: "#6E8FB0",
    lineHeight: 18,
  },
  disclaimerCard: {
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: ui.card,
    paddingVertical: 13,
    paddingHorizontal: 12,
    ...shadows.card,
  },
  disclaimerEn: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  disclaimerFa: {
    fontSize: 14,
    lineHeight: 23,
    color: colors.textSecondary,
    fontWeight: "600",
    fontFamily: "sans-serif",
  },
});
