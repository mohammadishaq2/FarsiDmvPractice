import { Platform, StyleSheet, Text, TextStyle, View } from "react-native";

type BilingualTextProps = {
  en: string;
  fa: string;
  enStyle?: TextStyle;
  faStyle?: TextStyle;
};

export function BilingualText({
  en,
  fa,
  enStyle,
  faStyle,
}: BilingualTextProps) {
  return (
    <View>
      <Text style={[styles.en, enStyle]}>{en}</Text>
      <Text style={[styles.fa, faStyle]}>{fa}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  en: {
    textAlign: "left",
    writingDirection: "ltr",
  },
  fa: {
    marginTop: 3,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 13,
    color: "#4E6A84",
    fontFamily: Platform.select({
      ios: "Geeza Pro",
      android: "sans-serif",
      default: "sans-serif",
    }),
  },
});
