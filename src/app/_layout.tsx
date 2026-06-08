import { Stack } from "expo-router";
import { useEffect } from "react";

import { incrementAppOpenCount } from "../utils/reviewUtils";

export default function RootLayout() {
  useEffect(() => {
    void incrementAppOpenCount();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F3F7FB" },
        animation: "slide_from_right",
      }}
    />
  );
}
