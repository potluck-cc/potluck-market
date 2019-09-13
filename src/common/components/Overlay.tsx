import React, { ReactChild } from "react";
import { View, StyleSheet } from "react-native";

export type OverlayProps = {
  children: ReactChild;
  style?: { [key: string]: string | number };
  opacity?: number;
};

export default function Overlay({
  children,
  style,
  opacity = 0.5
}: OverlayProps) {
  const styles = StyleSheet.create({
    overlay: {
      backgroundColor: `rgba(0, 0, 0, ${opacity})`,
      position: "absolute",
      height: "100%",
      width: "100%",
      ...style
    }
  });

  return <View style={styles.overlay}>{children}</View>;
}
