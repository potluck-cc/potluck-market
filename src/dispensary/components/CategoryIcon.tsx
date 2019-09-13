import React from "react";
import {
  View,
  Image,
  StyleSheet,
  ImageSourcePropType,
  ViewStyle,
  ImageStyle
} from "react-native";

type CategoryIconProps = {
  source: ImageSourcePropType;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
};

export default function CategoryIcon({
  source,
  containerStyle,
  imageStyle
}: CategoryIconProps) {
  const styles = StyleSheet.create({
    container: {
      width: 90,
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

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={source} />
    </View>
  );
}
