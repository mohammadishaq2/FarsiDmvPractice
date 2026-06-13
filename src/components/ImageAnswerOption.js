import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export function ImageAnswerOption({
  imageSource,
  enLabel,
  faLabel,
  isSelected = false,
  isCorrect = false,
  isWrong = false,
  onPress,
}) {
  const stateStyle = isCorrect
    ? styles.cardCorrect
    : isWrong
      ? styles.cardWrong
      : isSelected
        ? styles.cardSelected
        : null;

  return (
    <Pressable style={[styles.card, stateStyle]} onPress={onPress}>
      <View style={styles.imageWrap}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEn}>Image missing</Text>
            <Text style={styles.placeholderFa}>تصویر موجود نیست</Text>
          </View>
        )}
      </View>

      <View style={styles.labelsRow}>
        <Text style={styles.labelEn}>{enLabel}</Text>
        <Text style={styles.labelFa}>{faLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D6E4F5",
    backgroundColor: "#FFFFFF",
    padding: 8,
    width: "31.8%",
    minWidth: 98,
    flexGrow: 1,
    gap: 8,
  },
  cardSelected: {
    borderColor: "#73A6DB",
    backgroundColor: "#F1F8FF",
  },
  cardCorrect: {
    borderColor: "#3A9C69",
    backgroundColor: "#EAF8F0",
  },
  cardWrong: {
    borderColor: "#CF5252",
    backgroundColor: "#FDEEEE",
  },
  imageWrap: {
    borderRadius: 10,
    backgroundColor: "#EEF4FB",
    height: 86,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: 6,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  placeholderEn: {
    fontSize: 11,
    lineHeight: 16,
    color: "#536B83",
    textAlign: "center",
    writingDirection: "ltr",
    fontWeight: "700",
  },
  placeholderFa: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    color: "#536B83",
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "700",
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelEn: {
    fontSize: 13,
    color: "#234563",
    textAlign: "left",
    writingDirection: "ltr",
    fontWeight: "800",
  },
  labelFa: {
    fontSize: 13,
    color: "#234563",
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "800",
  },
});
