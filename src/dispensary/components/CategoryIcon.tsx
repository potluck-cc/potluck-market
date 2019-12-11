import React, { memo } from "react";
import {
  Image,
  StyleSheet,
  ImageSourcePropType,
  ViewStyle,
  ImageStyle,
  TouchableOpacity,
  Platform
} from "react-native";
import { useDimensions } from "common";
import { isMobile } from "react-device-detect";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

type CategoryIconProps = {
  source: ImageSourcePropType;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  onPress?: () => void;
};

export default function CategoryIcon({
  source,
  containerStyle,
  imageStyle,
  onPress = () => {}
}: CategoryIconProps) {
  const { widthToDP } = useDimensions();

  const styles = StyleSheet.create({
    container: {
      zIndex: 999,
      width: Platform.select({
        default: widthToDP("25%"),
        web: !isMobile ? widthToDP("19%") : widthToDP("25%")
      }),
      borderRadius: 10,
      height: 45,
      justifyContent: "center",
      alignItems: "center",
      ...containerStyle
    },
    image: {
      height: 35,
      width: 35,
      ...imageStyle
    }
  });

  return Platform.OS === "web" ? (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image style={styles.image} source={source} />
    </TouchableOpacity>
  ) : (
    <TouchableWithoutFeedback style={styles.container} onPress={onPress}>
      <Image style={styles.image} source={source} />
    </TouchableWithoutFeedback>
  );
}
