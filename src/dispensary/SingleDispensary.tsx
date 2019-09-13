import React, { memo, useState } from "react";
import {
  Linking,
  StatusBar,
  Platform,
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { Colors, Dimensions, isIphoneXorAbove, isTablet } from "common";
import { ButtonHeader, Divider } from "common/components";
import { Text, Button } from "react-native-ui-kitten";
import ImageView from "react-native-image-view";
import { Transition } from "react-navigation-fluid-transitions";
import { Image } from "react-native-expo-image-cache";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

type SingleStoreProps = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

function SingleStore({
  navigation: { getParam, goBack, navigate }
}: SingleStoreProps) {
  const store: import("@potluckmarket/louis").Store = getParam("store", {});
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const date = new Date();

  const images = [
    {
      source: {
        uri: store && store.storefrontImage ? store.storefrontImage : null
      }
    }
  ];

  function renderHours(hours) {
    return hours.map((timeblock, index) => {
      const str = `${timeblock.day}: ${timeblock.startTime} - ${timeblock.endTime}`;
      return (
        <Text
          style={styles.text}
          category={index === date.getDay() ? "s1" : null}
          key={index}
        >
          {str}
        </Text>
      );
    });
  }

  function customTransition(transitionInfo) {
    // only looks good on ios.. leaving out for now.
    const { progress, start, end } = transitionInfo;
    const scaleInterpolation = progress.interpolate({
      inputRange: [0, start, end, 1],
      outputRange: [0, 0.5, 1, 1]
    });
    return { transform: [{ scale: scaleInterpolation }] };
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar hidden />

      <Transition shared={store.storefrontImage}>
        <TouchableOpacity
          onPress={() => setIsImageModalVisible(true)}
          activeOpacity={0.8}
          disabled={!store || !store.storefrontImage}
        >
          <Image
            {...{
              preview: { uri: store.storefrontImage },
              uri: store.storefrontImage
            }}
            style={styles.imageHeader}
          />
          <ButtonHeader onBackBtnPress={() => goBack()} />
        </TouchableOpacity>
      </Transition>

      <Transition anchor={store.storefrontImage} appear="bottom">
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => Linking.openURL(`${store.link}`)}>
            <Text category="h2" style={styles.dispensaryName}>
              {store.name}
            </Text>
          </TouchableOpacity>

          <Button
            onPress={() => {
              navigate("Menu", {
                menu: true,
                store
              });
            }}
            style={styles.btn}
            activeOpacity={0.6}
          >
            VIEW MENU
          </Button>

          <Divider style={styles.divider} />

          <View style={styles.informationContainer}>
            <Text category="h6" style={styles.title}>
              Info
            </Text>

            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === "ios") {
                  Linking.openURL(
                    `http://maps.apple.com/maps?daddr=${store.latitude},${store.longitude}`
                  );
                } else {
                  Linking.openURL(
                    `http://maps.google.com/maps?daddr=${store.latitude},${store.longitude}`
                  );
                }
              }}
            >
              <Text
                style={styles.text}
              >{`${store.street} ${store.city}, ${store.state} ${store.zip}`}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${store.phone}`)}
            >
              <Text style={styles.text}>{store.phone}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.hoursContainer}>
            <Text category="h6" style={styles.title}>
              Hours
            </Text>
            {store.hours && renderHours(store.hours)}
          </View>
        </View>
      </Transition>

      {store && store.storefrontImage && (
        <ImageView
          images={images}
          imageIndex={0}
          isVisible={isImageModalVisible}
          onClose={() => setIsImageModalVisible(false)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingTop: Platform.select({
      ios: isIphoneXorAbove() ? 50 : null
    })
  },
  imageHeader: {
    height: Dimensions.width,
    width: Dimensions.width
  },
  dispensaryName: {
    textAlign: "center",
    fontSize: scale(24),
    padding: isTablet() ? scale(10) : 0
  },
  detailHeader: {
    marginTop: -50,
    borderRadius: 25,
    padding: 25,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    backgroundColor: "white"
  },
  divider: {
    marginTop: 10,
    marginBottom: 10
  },
  hoursContainer: {
    marginTop: 10,
    marginBottom: 10
  },
  title: {
    marginBottom: 5,
    textAlign: "center",
    fontSize: scale(16),
    padding: isTablet() ? scale(5) : 0
  },
  informationContainer: {
    marginTop: 5,
    marginBottom: 10
  },
  text: {
    fontSize: scale(14),
    padding: isTablet() ? scale(5) : 3
  },
  btn: {
    marginTop: 30,
    marginLeft: 40,
    marginRight: 40,
    marginBottom: 30,
    backgroundColor: Colors.medGreen,
    borderColor: Colors.medGreen,
    width: "85%"
  }
});

export default memo(SingleStore);
