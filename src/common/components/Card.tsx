import React, { memo } from "react";
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
import { Colors, Dimensions, isTablet, useDimensions } from "common";
import { Text } from "@ui-kitten/components";
import { Transition } from "react-navigation-fluid-transitions";
import { Image as CacheImage } from "react-native-expo-image-cache";
import { scale } from "react-native-size-matters";
import { isBrowser } from "react-device-detect";

export enum CardSize {
  small = "small",
  large = "large"
}

type CardProps = {
  onPress?: (event: GestureResponderEvent) => void;
  title?: string;
  description?: string;
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

export default memo(function Card({
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
  resizeMode
}: CardProps) {
  const { widthToDP, heightToDP, isLandscape } = useDimensions();

  const smallCardStyles = {
    container: {
      minHeight: 0,
      marginTop: 7.5,
      marginBottom: 7.5,
      backgroundColor: "white",
      borderColor: "#ddd",
      shadowOffset: { width: 1, height: 0 },
      shadowColor: "black",
      shadowOpacity: 0.2,
      borderRadius: 15,
      height: scale(250),
      width: widthToDP("45%"),
      elevation: Platform.select({
        android: 5
      })
    },
    header: {
      height: "50%",
      width: "100%",
      alignItems: "center",
      overflow: "hidden",
      borderTopRightRadius: 15,
      borderTopLeftRadius: 15
    },
    details: {
      height: "50%"
    }
  };

  const headerStyles =
    cardSize === CardSize.small ? { ...smallCardStyles.header } : {};

  const containerStyles =
    cardSize === CardSize.small ? { ...smallCardStyles.container } : {};

  const detailStyles =
    cardSize === CardSize.small ? { ...smallCardStyles.details } : {};

  const styles = StyleSheet.create({
    container: {
      minHeight: Platform.select({
        web: isBrowser ? 505 : heightToDP("70%")
        // ios: verticalScale(350),
        // android: verticalScale(350)
      }),
      height: Platform.select({
        web: heightToDP("50%"),
        ios: isLandscape ? heightToDP("60%") : heightToDP("50%"),
        android: heightToDP("50%")
      }),
      width: Platform.select({
        ios: Dimensions.width / 1.5,
        android: Dimensions.width / 1.5,
        web: widthToDP("80%")
      }),
      maxWidth: 1024,
      borderRadius: borderRadius,
      borderColor: "transparent",
      shadowColor: "#000",
      borderLeftWidth: Platform.OS === "web" ? null : 1,
      borderRightWidth: Platform.OS === "web" ? null : 1,
      shadowOffset: {
        width: 0,
        height: 6
      },
      shadowOpacity: 0.39,
      shadowRadius: 8.3,
      zIndex: 999,
      elevation: Platform.select({
        android: 9
      }),
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
      fontSize: Platform.select({
        ios: scale(16),
        android: scale(16),
        web: isLandscape ? heightToDP("5%") : heightToDP("3%")
      }),
      padding: isTablet() ? (isLandscape ? 0 : scale(5)) : 0,
      width: "100%",
      textAlign: "center",
      lineHeight: scale(20),
      ...titleStyle
    },
    description: {
      textAlign: "center",
      width: "100%",
      fontSize: isLandscape
        ? heightToDP("4%")
        : Platform.OS === "web"
        ? heightToDP("3%")
        : heightToDP("2%"),
      padding: isTablet() ? scale(6) : 2,
      // lineHeight: scale(13),
      ...descriptionStyle
    }
  });

  function renderHeaderImage() {
    const HeaderImage = () => {
      if (imageSource) {
        const uri = imageSource;
        const preview = { uri: imageSource };

        if (Platform.OS === "web") {
          return (
            <Image
              source={{ uri }}
              style={styles.headerImage}
              resizeMode={resizeMode ? resizeMode : "cover"}
            />
          );
        }

        return (
          <CacheImage
            {...{ preview, uri }}
            style={styles.headerImage}
            resizeMode={resizeMode ? resizeMode : "cover"}
          />
        );
      } else {
        return (
          <Image
            source={
              localImage
                ? localImage
                : require("assets/images/potluck_logo.png")
            }
            resizeMode={resizeMode ? resizeMode : "cover"}
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
        {title && (
          <Text category="s1" style={styles.title}>
            {title}
          </Text>
        )}

        {description && (
          <Text category="c1" style={styles.description}>
            {description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});
