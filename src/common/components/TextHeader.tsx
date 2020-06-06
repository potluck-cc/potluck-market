import React from "react";
import { View, StyleSheet, ViewStyle, TextStyle, Platform } from "react-native";
import { Text } from "@ui-kitten/components";
import { isTablet, useDimensions } from "common";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { isBrowser } from "react-device-detect";

type TextHeaderProps = {
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  title: string;
  subtitle: string;
};

export default function TextHeader({
  containerStyle,
  titleStyle,
  subtitleStyle,
  title,
  subtitle
}: TextHeaderProps) {
  const { dimensions } = useDimensions();

  const styles = StyleSheet.create({
    container: {
      width: dimensions.width,
      justifyContent: "flex-start",
      paddingLeft: scale(20),
      paddingBottom: scale(10),
      ...containerStyle
    },
    title: {
      fontSize: scale(14),
      paddingTop: Platform.select({
        ios: isTablet() ? scale(16) : 0,
        android: isTablet() ? scale(16) : 0,
        web: 15
      }),
      ...titleStyle
    },
    subtitle: {
      fontSize: scale(32),
      paddingTop: Platform.select({
        ios: isTablet() ? scale(16) : 0,
        android: isTablet() ? scale(16) : 0,
        web: isBrowser ? 8 : 0
      }),
      ...subtitleStyle
    }
  });

  return (
    <View style={styles.container}>
      <Text category="c1" style={styles.title}>
        {title}
      </Text>
      <Text category="h1" style={styles.subtitle}>
        {subtitle}
      </Text>
    </View>
  );
}
