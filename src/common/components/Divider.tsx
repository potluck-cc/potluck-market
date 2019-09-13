import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "common";

type DividerProps = {
  style?: { [key: string]: string | number };
  children?: JSX.Element;
};

export default function Divider({ style, children }: DividerProps) {
  const styles = StyleSheet.create({
    divider: {
      height: 1,
      width: "100%",
      borderColor: Colors.gray,
      borderWidth: 1,
      ...style
    }
  });

  return <View style={styles.divider}>{children && children}</View>;
}
