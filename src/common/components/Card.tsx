import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Image,
  View,
  Platform,
  GestureResponderEvent,
  ViewStyle,
  ImageStyle,
  TextStyle,
  ImageSourcePropType,
  ImageResizeMode
} from "react-native";
import { Colors, Dimensions, isTablet } from "common";
import { Text } from "react-native-ui-kitten";
import { Transition } from "react-navigation-fluid-transitions";
import { Image as CacheImage } from "react-native-expo-image-cache";
import { scale, verticalScale } from "react-native-size-matters";

export enum CardSize {
  small = "small",
  large = "large"
}

type CardProps = {
  onPress?: (event: GestureResponderEvent) => void;
  title: string;
  description: string;
  imageSource?: string;
  containerStyle?: ViewStyle;
  headerContainerStyle?: ViewStyle;
  headerImageStyle?: ImageStyle;
  detailsContainerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  sharedTransition?: boolean;
  cardSize?: CardSize;
  borderRadius?: number;
  localImage?: ImageSourcePropType;
  resizeMode?: ImageResizeMode;
};

const smallCardStyles = {
  container: {
    minHeight: 0,
    marginTop: 7.5,
    marginBottom: 7.5,
    backgroundColor: "white",
    shadowOffset: { width: 1, height: 0 },
    shadowColor: "black",
    shadowOpacity: 0.2,
    elevation: 1,
    borderRadius: 15,
    height: scale(250),
    width: scale(170)
  },
  header: {
    height: "50%",
    width: "100%",
    alignItems: "center",
    overflow: "hidden",
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    borderColor: "transparent"
  },
  details: {
    height: "50%"
  }
};

export default function Card({
  onPress,
  imageSource,
  title,
  description,
  containerStyle = {},
  headerContainerStyle = {},
  headerImageStyle = {},
  detailsContainerStyle = {},
  titleStyle = {},
  descriptionStyle = {},
  sharedTransition = false,
  cardSize = CardSize.large,
  borderRadius = 15,
  localImage,
  resizeMode = "cover"
}: CardProps) {
  const headerStyles =
    cardSize === CardSize.small ? { ...smallCardStyles.header } : {};

  const containerStyles =
    cardSize === CardSize.small ? { ...smallCardStyles.container } : {};

  const detailStyles =
    cardSize === CardSize.small ? { ...smallCardStyles.details } : {};

  const styles = StyleSheet.create({
    container: {
      minHeight: verticalScale(350),
      height: "80%",
      borderRadius: borderRadius,
      borderColor: "transparent",
      width: Dimensions.width / 1.5,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 6
      },
      shadowOpacity: 0.39,
      shadowRadius: 8.3,
      elevation: 13,
      zIndex: 999,
      ...containerStyles,
      ...containerStyle
    },
    header: {
      height: "70%",
      borderTopRightRadius: borderRadius,
      borderTopLeftRadius: borderRadius,
      borderTopWidth: 1,
      borderColor: Colors.gray,
      overflow: "hidden",
      ...headerStyles,
      ...headerContainerStyle
    },
    headerImage: {
      width: "100%",
      height: "100%",
      borderTopRightRadius: borderRadius,
      borderTopLeftRadius: borderRadius,
      borderColor: Colors.gray,
      ...headerImageStyle
    },
    details: {
      backgroundColor: "white",
      borderBottomRightRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
      borderWidth: Platform.select({
        ios: borderRadius
      }),
      borderColor: Platform.select({
        ios: "transparent"
      }),
      justifyContent: "center",
      alignItems: "center",
      height: "30%",
      ...detailStyles,
      ...detailsContainerStyle
    },
    title: {
      marginBottom: scale(10),
      fontSize: scale(16),
      padding: isTablet() ? scale(5) : 0,
      width: "100%",
      textAlign: "center",
      lineHeight: scale(20),
      ...titleStyle
    },
    description: {
      textAlign: "center",
      width: "100%",
      fontSize: scale(14),
      padding: isTablet() ? scale(6) : 2,
      lineHeight: scale(13),
      ...descriptionStyle
    }
  });

  function renderHeaderImage() {
    const HeaderImage = () => {
      if (imageSource) {
        const uri = imageSource;
        const preview = { uri: imageSource };

        return (
          <CacheImage
            {...{ preview, uri }}
            style={styles.headerImage}
            resizeMode={
              resizeMode
                ? resizeMode
                : cardSize === CardSize.small
                ? "contain"
                : "cover"
            }
          />
        );
      } else {
        return (
          <Image
            source={
              localImage
                ? localImage
                : require("assets/images/potluck_default.png")
            }
            resizeMode={resizeMode}
            style={styles.headerImage}
          />
        );
      }
    };

    if (sharedTransition) {
      <Transition shared={imageSource}>
        <HeaderImage />
      </Transition>;
    } else {
      return <HeaderImage />;
    }
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={onPress ? false : true}
    >
      <View style={styles.header}>{renderHeaderImage()}</View>
      <View style={styles.details}>
        <Text category="s1" style={styles.title}>
          {title}
        </Text>
        <Text category="c1" style={styles.description}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
