import React from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Platform
} from "react-native";
import { Text } from "react-native-ui-kitten";
import { useDimensions, isLandscape } from "common";
import { isBrowser, isMobile } from "react-device-detect";

type CartHeaderProps = {
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  renderCustomRight?: () => JSX.Element;
  onPress?: Function;
  count?: number;
  disabled?: boolean;
};

export default function({
  containerStyle,
  titleStyle,
  renderCustomRight,
  onPress = () => {},
  count = 0,
  disabled
}: CartHeaderProps) {
  const { heightToDP, dimensions } = useDimensions();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          height: isLandscape(dimensions) ? heightToDP("15%") : heightToDP("8%")
        },
        containerStyle
      ]}
      onPress={() => onPress()}
      disabled={disabled}
    >
      <Text category="c2" style={[styles.text, titleStyle]}>
        Cart
      </Text>

      {renderCustomRight ? (
        renderCustomRight()
      ) : (
        <View style={styles.countContainer}>
          <Text category="c2" style={styles.text}>
            {`${count}`}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Platform.select({
      default: 50,
      web: isBrowser && isMobile ? 200 : 50
    })
  },
  text: {
    color: "white",
    fontSize: 18
  },
  countContainer: {
    height: 50,
    width: 50,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1C1E1D"
  }
});
