import React from "react";
import {
  View,
  Image,
  StyleSheet,
  ImageSourcePropType,
  ViewStyle,
  ImageStyle,
  Platform
} from "react-native";
import { useDimensions } from "common";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { isMobile, isBrowser } from "react-device-detect";

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
  onPress
}: CategoryIconProps) {
  const { widthToDP } = useDimensions();

  const styles = StyleSheet.create({
    container: {
      zIndex: 999,
      width: Platform.select({
        web: widthToDP("15%"),
        ios: widthToDP("25%"),
        android: widthToDP("25%")
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
    <View style={styles.container}>
      <Image style={styles.image} source={source} />
    </View>
  ) : (
    <TouchableWithoutFeedback style={styles.container} onPress={onPress}>
      <Image style={styles.image} source={source} />
    </TouchableWithoutFeedback>
  );
}
