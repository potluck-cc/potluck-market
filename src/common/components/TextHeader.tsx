import React from "react";
import { View, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Text } from "react-native-ui-kitten";
import { Dimensions, isTablet } from "common";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

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
  const styles = StyleSheet.create({
    container: {
      width: Dimensions.width,
      justifyContent: "flex-start",
      paddingLeft: scale(20),
      paddingBottom: scale(10),
      ...containerStyle
    },
    title: {
      fontSize: scale(14),
      paddingTop: isTablet() ? scale(16) : 0,
      ...titleStyle
    },
    subtitle: {
      fontSize: scale(32),
      paddingTop: isTablet() ? scale(16) : 0,
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
