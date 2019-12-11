import React from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
  Platform,
  Image as DefaultImage
} from "react-native";
import { Transition } from "react-navigation-fluid-transitions";
import { Image as CacheImage } from "react-native-expo-image-cache";
import { useDimensions, Colors, isIphoneXorAbove, isTablet } from "common";
import { isMobile, isBrowser } from "react-device-detect";
import Svg, { Circle, G, Defs, ClipPath, Image } from "react-native-svg";
import { Icon } from "react-native-elements";

type DisplayProps = {
  onImagePress: () => void;
  imagePressDisabled: boolean;
  renderHeader: () => JSX.Element;
  imageSource: string;
  imageSmall?: boolean;
  transition?: boolean;
  renderContent: () => JSX.Element;
  onBtnPress?: () => void;
  renderMainBtn?: boolean;
  aspectRatio?: string;
  renderSvg?: boolean;
  icon?: () => JSX.Element;
};

function Display({
  onImagePress,
  imagePressDisabled,
  renderHeader,
  imageSource,
  transition = false,
  renderContent,
  onBtnPress = () => {},
  renderMainBtn = false,
  aspectRatio,
  renderSvg = false,
  icon
}: DisplayProps) {
  const {
    heightToDP,
    widthToDP,
    dimensions: { height },
    isLandscape
  } = useDimensions();

  // const bottomTabPadding =
  //   Platform.OS === "web" ? 0 : isIphoneXorAbove() ? 80 : 48;

  const styles = StyleSheet.create({});

  function DisplayContainer({ children }) {
    if (transition && Platform.OS !== "web") {
      return (
        <Transition shared={imageSource}>
          <View style={{ backgroundColor: "white" }}>{children}</View>
        </Transition>
      );
    } else {
      return <View style={{ backgroundColor: "white" }}>{children}</View>;
    }
  }

  function renderImage() {
    if (
      (Platform.OS === "web" && isBrowser) ||
      (Platform.OS === "web" && isLandscape)
    ) {
      return (
        <DefaultImage
          source={
            imageSource
              ? { uri: imageSource }
              : require("assets/images/potluck_logo.png")
          }
          style={{
            width: isLandscape
              ? widthToDP("100%")
              : isTablet()
              ? widthToDP("100%")
              : widthToDP("50%"),
            // width: widthToDP("100%"),
            height:
              isMobile && isLandscape ? heightToDP("80%") : heightToDP("50%")
          }}
          resizeMode={
            isMobile && isLandscape
              ? "stretch"
              : isTablet()
              ? "contain"
              : "contain"
          }
        />
      );
    }

    if (!renderSvg) {
      if (Platform.OS !== "web" && imageSource) {
        const uri = imageSource;
        const preview = { uri: imageSource };
        return (
          <CacheImage
            {...{ preview, uri }}
            style={{ width: widthToDP("80%"), height: heightToDP("30%") }}
            resizeMode="contain"
          />
        );
      } else {
        return (
          <DefaultImage
            source={
              imageSource
                ? { uri: imageSource }
                : require("assets/images/potluck_logo.png")
            }
            style={{
              width: Platform.select({
                default: widthToDP("80%"),
                web: isMobile ? widthToDP("80%") : widthToDP("30%")
              }),
              height: Platform.select({
                default: heightToDP("30%"),
                web: isMobile ? heightToDP("30%") : heightToDP("10%")
              })
            }}
            resizeMode="contain"
          />
        );
      }
    }

    if (Platform.OS === "web") {
      return (
        <svg
          width="100%"
          height={heightToDP("60%")}
          style={{ filter: "drop-shadow(-1px 6px 3px rgba(50, 50, 0, 0.5))" }}
        >
          <defs>
            <clipPath id="clip">
              <circle
                cx="50%"
                cy={heightToDP("15%")}
                r={widthToDP("60%")}
              ></circle>
            </clipPath>
          </defs>

          <g
            style={{
              clipPath: "url(#clip)"
            }}
          >
            <image
              clipPath="url(#clip)"
              height="100%"
              width="100%"
              preserveAspectRatio={aspectRatio ? aspectRatio : "xMidYMid slice"}
              xlinkHref={
                imageSource
                  ? imageSource
                  : require("assets/images/potluck_logo.png")
              }
            />
          </g>
        </svg>
      );
    } else {
      return (
        <Svg
          width="100%"
          height={heightToDP("60%")}
          style={{
            shadowColor: Colors.darkGreen,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 4
          }}
        >
          <Defs>
            <ClipPath id="clip">
              {/* <Circle cx="50%" cy="30%" r="250" /> */}
              {/* <Circle cx="50%" cy="25%" r="420" /> */}
              <Circle
                cx="50%"
                cy={
                  isTablet()
                    ? heightToDP("6%")
                    : isIphoneXorAbove()
                    ? heightToDP("18%")
                    : heightToDP("20%")
                }
                r={isTablet() ? widthToDP("55%") : widthToDP("65%")}
              />
            </ClipPath>
          </Defs>

          {Platform.OS === "ios" ? (
            <G clipPath="url(#clip)">
              <Image
                x="0"
                y="0"
                href={
                  imageSource
                    ? { uri: imageSource }
                    : require("assets/images/potluck_logo.png")
                }
                clipPath="#clip"
                height="100%"
                width="100%"
                preserveAspectRatio={
                  aspectRatio ? aspectRatio : "xMidYMid slice"
                }
              />
            </G>
          ) : (
            <Image
              x="0"
              y="0"
              href={
                imageSource
                  ? { uri: imageSource }
                  : require("assets/images/potluck_logo.png")
              }
              clipPath="#clip"
              height="100%"
              width="100%"
              preserveAspectRatio={aspectRatio ? aspectRatio : "xMidYMid slice"}
              style={{
                elevation: Platform.select({
                  android: 9
                })
              }}
            />
          )}
        </Svg>
      );
    }
  }

  function renderDisplay() {
    return (
      <View
        style={{
          flex: Platform.select({
            ios: 1,
            android: 1
          }),
          width: Platform.select({
            ios: widthToDP("100%")
          }),
          paddingBottom: 5,
          backgroundColor: "white"
        }}
      >
        <TouchableOpacity
          onPress={onImagePress}
          activeOpacity={0.8}
          disabled={imagePressDisabled}
          style={{
            alignItems: Platform.select({
              default: !renderSvg ? "center" : null,
              web: "center"
            }),
            marginTop: Platform.select({
              default: null,
              web: (isBrowser && !isTablet() && 10) || null
            })
          }}
        >
          {renderImage()}
        </TouchableOpacity>

        {renderMainBtn && (
          <TouchableOpacity
            onPress={() => onBtnPress()}
            style={{
              marginTop: isLandscape ? -20 : renderSvg ? -height / 7 : null,
              backgroundColor: Colors.medGreen,
              borderColor: Colors.medGreen,
              width: 100,
              height: 100,
              alignSelf: "center",
              borderRadius: 200,
              shadowColor: Colors.darkGreen,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 2,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
              elevation: Platform.select({
                android: 5
              })
            }}
            activeOpacity={0.6}
          >
            {icon ? (
              icon()
            ) : (
              <Icon name="align-right" size={60} color="white" type="feather" />
            )}
          </TouchableOpacity>
        )}

        {renderContent()}

        {renderHeader()}
      </View>
    );
  }

  return <DisplayContainer>{renderDisplay()}</DisplayContainer>;
}

const Component = Platform.OS === "web" ? Display : Display;

export default Component;
