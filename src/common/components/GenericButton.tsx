import React from "react";
import { StyleSheet, ViewStyle, TextStyle, Platform } from "react-native";
import { Button } from "@ui-kitten/components";
import { Colors, useDimensions } from "common";
import { isBrowser } from "react-device-detect";

type GenericButtonProps = {
  style?: ViewStyle;
  widthPercentage?: string;
  buttonText: string;
  activeOpacity?: number;
  textStyle?: TextStyle;
  heightPercentage?: string;
  onPress: Function;
  disabled?: boolean;
};

export default function({
  style,
  widthPercentage = Platform.select({
    default: "60%",
    web: isBrowser ? "25%" : "60%"
  }),
  heightPercentage = "25%",
  buttonText,
  activeOpacity = 0.5,
  textStyle,
  onPress,
  disabled
}: GenericButtonProps) {
  const { widthToDP, heightToDP } = useDimensions();

  const height = heightPercentage
    ? null
    : { height: heightToDP("heightPercentage") };

  return (
    <Button
      style={[
        styles.btn,
        {
          width: widthToDP(widthPercentage),
          ...height
        },
        style
      ]}
      activeOpacity={activeOpacity}
      textStyle={textStyle}
      onPress={() => onPress()}
      disabled={disabled}
    >
      {buttonText}
    </Button>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.medGreen,
    borderRadius: 25,
    borderColor: Colors.medGreen
  }
});
