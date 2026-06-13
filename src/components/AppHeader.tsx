import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as StoreReview from "expo-store-review";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { APP_NAME, APP_VERSION, FORMSPREE_ENDPOINT } from "../config/appConfig";
import { borderRadius, colors, spacing, typography } from "../constants/theme";

type AppHeaderProps = {
  titleEn: string;
  titleFa: string;
  subtitleEn?: string;
  subtitleFa?: string;
  showTitles?: boolean;
  wrapSafeArea?: boolean;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  onBackPress?: () => void;
  onHomePress?: () => void;
};

export function AppHeader({
  titleEn,
  titleFa,
  subtitleEn,
  subtitleFa,
  showTitles = true,
  wrapSafeArea = true,
  showBackButton = false,
  showHomeButton = false,
  onBackPress,
  onHomePress,
}: AppHeaderProps) {
  const router = useRouter();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [activeDialog, setActiveDialog] = useState<
    "rate" | "contact" | "about" | null
  >(null);
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactErrors, setContactErrors] = useState<{
    email?: string;
    message?: string;
  }>({});
  const [contactStatus, setContactStatus] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    router.back();
  };

  const handleHomePress = () => {
    if (onHomePress) {
      onHomePress();
      return;
    }

    router.replace("/");
  };

  const closeMenu = () => {
    setIsMenuVisible(false);
  };

  const openMenu = () => {
    setIsMenuVisible(true);
  };

  const openDialog = (dialog: "rate" | "contact" | "about") => {
    closeMenu();
    setActiveDialog(dialog);
    if (dialog !== "contact") {
      setContactStatus(null);
    }
  };

  const closeDialog = () => {
    setActiveDialog(null);
    setContactStatus(null);
  };

  const handleRateNow = async () => {
    closeDialog();

    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
        return;
      }

      Alert.alert("Review unavailable", "Review is not available right now.");
    } catch {
      Alert.alert("Review unavailable", "Review is not available right now.");
    }
  };

  const validateContactForm = () => {
    const nextErrors: { email?: string; message?: string } = {};
    const trimmedEmail = contactEmail.trim();
    const trimmedMessage = contactMessage.trim();

    if (!trimmedEmail) {
      nextErrors.email = "Email Address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!trimmedMessage) {
      nextErrors.message = "Message is required.";
    } else if (trimmedMessage.length < 10) {
      nextErrors.message = "Message must be at least 10 characters.";
    }

    setContactErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSendMessage = async () => {
    if (!validateContactForm()) {
      return;
    }

    setIsSendingMessage(true);
    setContactStatus(null);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: contactEmail.trim(),
          message: contactMessage.trim(),
          app: APP_NAME,
          source: "mobile-app-contact",
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setContactEmail("");
      setContactMessage("");
      setContactErrors({});
      setContactStatus({
        kind: "success",
        message: "Thank you. Your message was sent.",
      });
    } catch {
      setContactStatus({
        kind: "error",
        message: "Message failed. Please try again.",
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <>
      {wrapSafeArea ? (
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.leftWrap}>
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Open menu"
                onPress={openMenu}
              >
                <Ionicons name="menu" size={22} color={colors.textPrimary} />
              </Pressable>

              {showBackButton ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed && styles.iconButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  onPress={handleBackPress}
                >
                  <Text style={styles.iconText}>←</Text>
                </Pressable>
              ) : null}
            </View>

            {showTitles ? (
              <View style={styles.centerWrap}>
                <Text style={styles.titleEn}>{titleEn}</Text>
                <Text style={styles.titleFa}>{titleFa}</Text>
                {subtitleEn ? (
                  <Text style={styles.subtitleEn}>{subtitleEn}</Text>
                ) : null}
                {subtitleFa ? (
                  <Text style={styles.subtitleFa}>{subtitleFa}</Text>
                ) : null}
              </View>
            ) : (
              <View style={styles.centerSpacer} />
            )}

            <View style={styles.rightWrap}>
              {showHomeButton ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed && styles.iconButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Go to home screen"
                  onPress={handleHomePress}
                >
                  <Text style={styles.iconText}>⌂</Text>
                </Pressable>
              ) : (
                <View style={styles.iconSpacer} />
              )}
            </View>
          </View>
        </SafeAreaView>
      ) : (
        <View style={styles.container}>
          <View style={styles.leftWrap}>
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Open menu"
              onPress={openMenu}
            >
              <Ionicons name="menu" size={22} color={colors.textPrimary} />
            </Pressable>

            {showBackButton ? (
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={handleBackPress}
              >
                <Text style={styles.iconText}>←</Text>
              </Pressable>
            ) : null}
          </View>

          {showTitles ? (
            <View style={styles.centerWrap}>
              <Text style={styles.titleEn}>{titleEn}</Text>
              <Text style={styles.titleFa}>{titleFa}</Text>
              {subtitleEn ? (
                <Text style={styles.subtitleEn}>{subtitleEn}</Text>
              ) : null}
              {subtitleFa ? (
                <Text style={styles.subtitleFa}>{subtitleFa}</Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.centerSpacer} />
          )}

          <View style={styles.rightWrap}>
            {showHomeButton ? (
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Go to home screen"
                onPress={handleHomePress}
              >
                <Text style={styles.iconText}>⌂</Text>
              </Pressable>
            ) : (
              <View style={styles.iconSpacer} />
            )}
          </View>
        </View>
      )}

      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdropPressable} onPress={closeMenu} />
          <View style={styles.menuCard}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>Menu</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.iconButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Close menu"
                onPress={closeMenu}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>

            <View style={styles.menuActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.menuButton,
                  pressed && styles.menuButtonPressed,
                ]}
                accessibilityRole="button"
                onPress={() => openDialog("rate")}
              >
                <Text style={styles.menuButtonText}>Rate App</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.menuButton,
                  pressed && styles.menuButtonPressed,
                ]}
                accessibilityRole="button"
                onPress={() => openDialog("contact")}
              >
                <Text style={styles.menuButtonText}>Contact</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.menuButton,
                  pressed && styles.menuButtonPressed,
                ]}
                accessibilityRole="button"
                onPress={() => openDialog("about")}
              >
                <Text style={styles.menuButtonText}>About</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={activeDialog === "rate"}
        transparent
        animationType="fade"
        onRequestClose={closeDialog}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdropPressable} onPress={closeDialog} />
          <View style={styles.dialogCard}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>
                Enjoying Farsi DMV Practice?
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.iconButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Close rate dialog"
                onPress={closeDialog}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>

            <Text style={styles.dialogBody}>
              Your review helps us improve the app.
            </Text>

            <View style={styles.dialogActionsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryActionButton,
                  pressed && styles.secondaryActionButtonPressed,
                ]}
                accessibilityRole="button"
                onPress={closeDialog}
              >
                <Text style={styles.secondaryActionText}>Later</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryActionButton,
                  pressed && styles.primaryActionButtonPressed,
                ]}
                accessibilityRole="button"
                onPress={() => {
                  void handleRateNow();
                }}
              >
                <Text style={styles.primaryActionText}>Rate Now</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={activeDialog === "contact"}
        transparent
        animationType="fade"
        onRequestClose={closeDialog}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdropPressable} onPress={closeDialog} />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardWrap}
          >
            <View style={styles.dialogCard}>
              <View style={styles.dialogHeader}>
                <Text style={styles.dialogTitle}>Contact</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.closeButton,
                    pressed && styles.iconButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Close contact dialog"
                  onPress={closeDialog}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contactContent}
              >
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
                  <TextInput
                    value={contactEmail}
                    onChangeText={(text) => {
                      setContactEmail(text);
                      if (contactErrors.email) {
                        setContactErrors((current) => ({
                          ...current,
                          email: undefined,
                        }));
                      }
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="you@example.com"
                    placeholderTextColor="#7A92A8"
                    style={styles.textInput}
                  />
                  {contactErrors.email ? (
                    <Text style={styles.fieldError}>{contactErrors.email}</Text>
                  ) : null}
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Message</Text>
                  <TextInput
                    value={contactMessage}
                    onChangeText={(text) => {
                      setContactMessage(text);
                      if (contactErrors.message) {
                        setContactErrors((current) => ({
                          ...current,
                          message: undefined,
                        }));
                      }
                    }}
                    multiline
                    placeholder="How can we help?"
                    placeholderTextColor="#7A92A8"
                    style={styles.textArea}
                    textAlignVertical="top"
                  />
                  {contactErrors.message ? (
                    <Text style={styles.fieldError}>
                      {contactErrors.message}
                    </Text>
                  ) : null}
                </View>

                {contactStatus ? (
                  <View
                    style={[
                      styles.statusBox,
                      contactStatus.kind === "success"
                        ? styles.statusBoxSuccess
                        : styles.statusBoxError,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        contactStatus.kind === "success"
                          ? styles.statusTextSuccess
                          : styles.statusTextError,
                      ]}
                    >
                      {contactStatus.message}
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  style={({ pressed }) => [
                    styles.primarySubmitButton,
                    pressed &&
                      !isSendingMessage &&
                      styles.primarySubmitButtonPressed,
                    isSendingMessage && styles.primarySubmitButtonDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isSendingMessage }}
                  disabled={isSendingMessage}
                  onPress={() => {
                    void handleSendMessage();
                  }}
                >
                  <Text style={styles.primarySubmitText}>
                    {isSendingMessage ? "Sending..." : "Send Message"}
                  </Text>
                </Pressable>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        visible={activeDialog === "about"}
        transparent
        animationType="fade"
        onRequestClose={closeDialog}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdropPressable} onPress={closeDialog} />
          <View style={styles.dialogCard}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>About</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.iconButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Close about dialog"
                onPress={closeDialog}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>

            <Text style={styles.aboutAppName}>{APP_NAME}</Text>
            <Text style={styles.dialogBody}>
              Practice California DMV questions in English and Farsi.
            </Text>
            <Text style={styles.aboutDeveloper}>Developer: Mohammad Ishaq</Text>
            <Text style={styles.aboutVersion}>Version {APP_VERSION}</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#E8F1FB",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: 6,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
    backgroundColor: "#E8F1FB",
  },
  leftWrap: {
    width: 98,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
  },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  centerSpacer: {
    flex: 1,
  },
  rightWrap: {
    width: 50,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D6E5F5",
  },
  iconButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
  iconSpacer: {
    width: 44,
    height: 44,
  },
  iconText: {
    fontSize: 21,
    lineHeight: 24,
    color: colors.textPrimary,
    fontWeight: "800",
  },
  titleEn: {
    ...typography.title,
    fontSize: 22,
    lineHeight: 28,
    color: colors.textPrimary,
    textAlign: "left",
    writingDirection: "ltr",
    alignSelf: "stretch",
  },
  titleFa: {
    marginTop: 2,
    fontSize: 16,
    lineHeight: 23,
    color: "#1D4B74",
    fontWeight: "700",
    textAlign: "right",
    writingDirection: "rtl",
    alignSelf: "stretch",
  },
  subtitleEn: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#335F88",
    textAlign: "left",
    writingDirection: "ltr",
    alignSelf: "stretch",
  },
  subtitleFa: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 18,
    color: "#456E92",
    textAlign: "right",
    writingDirection: "rtl",
    alignSelf: "stretch",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 28, 46, 0.45)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFill,
  },
  keyboardWrap: {
    flex: 1,
    justifyContent: "center",
  },
  menuCard: {
    borderRadius: 22,
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#173958",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  dialogCard: {
    borderRadius: 22,
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#173958",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    maxHeight: "88%",
  },
  dialogHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: spacing.md,
  },
  dialogTitle: {
    flex: 1,
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F6FC",
  },
  closeButtonText: {
    fontSize: 26,
    lineHeight: 26,
    color: colors.textPrimary,
    fontWeight: "500",
    marginTop: -2,
  },
  menuActions: {
    gap: 10,
  },
  menuButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#F3F8FE",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: "#D8E7F7",
  },
  menuButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  dialogBody: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  dialogActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: spacing.lg,
  },
  secondaryActionButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F8FC",
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryActionButtonPressed: {
    opacity: 0.84,
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  primaryActionButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  primaryActionButtonPressed: {
    opacity: 0.88,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  contactContent: {
    gap: 14,
    paddingBottom: 4,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  textInput: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: "#F8FBFE",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 120,
    borderRadius: 16,
    backgroundColor: "#F8FBFE",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  fieldError: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.error,
  },
  statusBox: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  statusBoxSuccess: {
    backgroundColor: "#EEF9F2",
    borderColor: "#BFE6CF",
  },
  statusBoxError: {
    backgroundColor: "#FFF2F2",
    borderColor: "#F1B7B7",
  },
  statusText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  statusTextSuccess: {
    color: colors.success,
  },
  statusTextError: {
    color: colors.error,
  },
  primarySubmitButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primarySubmitButtonPressed: {
    opacity: 0.88,
  },
  primarySubmitButtonDisabled: {
    opacity: 0.55,
  },
  primarySubmitText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  aboutAppName: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  aboutVersion: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  aboutDeveloper: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    fontWeight: "700",
  },
});
