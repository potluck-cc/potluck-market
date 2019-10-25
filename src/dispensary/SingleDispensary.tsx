import React, { memo, useState, useEffect, Suspense, lazy } from "react";
import { View, Platform, ActivityIndicator, StyleSheet } from "react-native";
import { useTimer, slugify, RNWebComponent, Colors, isTablet } from "common";
import { Text } from "react-native-ui-kitten";
import { Analytics } from "aws-amplify";
import { Lightbox } from "./components";
import { isBrowser } from "react-device-detect";
import { scale } from "react-native-size-matters";

const Layout = lazy(() =>
  Platform.OS === "web"
    ? isBrowser
      ? import("./components/SingleDispensaryWebView")
      : import("./components/SingleDispensaryMobileView")
    : import("./components/SingleDispensaryMobileView")
);

function SingleStore(props: RNWebComponent) {
  const store: import("@potluckmarket/louis").Store =
    Platform.OS === "web"
      ? props.location.state[0].store
      : props.navigation.getParam("store", {});

  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  const date = new Date();

  const { start, end } = useTimer();

  useEffect(() => {
    start();

    return () => {
      const visitTime = end();
      recordPageVisit(visitTime);
    };
  }, []);

  function recordPageVisit(visitTime: number) {
    if (store && store.name) {
      Analytics.record({
        name: "dispensaryVisit",
        attributes: {
          dispensaryName: store.name
        },
        metrics: {
          secondsBrowsed: visitTime
        }
      });
    } else {
      Analytics.record({
        name: "dispensaryVisit",
        metrics: {
          secondsBrowsed: visitTime
        }
      });
    }
  }

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

  function renderLightbox() {
    let images = [];

    if (Platform.OS === "web") {
      images = [store.storefrontImage];
    } else {
      images = [
        {
          source: {
            uri: store && store.storefrontImage ? store.storefrontImage : null
          }
        }
      ];
    }

    return (
      <Lightbox
        images={images}
        isImageModalVisible={isImageModalVisible}
        close={() => setIsImageModalVisible(false)}
      />
    );
  }

  function goBack() {
    if (Platform.OS === "web") {
      props.history.goBack();
    } else {
      props.navigation.goBack();
    }
  }

  function onImagePress() {
    setIsImageModalVisible(true);
  }

  function goToMenu() {
    if (Platform.OS === "web") {
      props.history.push(`/dispensary/${slugify(store.name)}/menu`, [
        { store }
      ]);
    } else {
      props.navigation.navigate("Menu", {
        menu: true,
        store
      });
    }
  }

  return (
    <Suspense
      fallback={
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={Colors.green} />
        </View>
      }
    >
      <Layout
        store={store}
        goBack={goBack}
        onImagePress={onImagePress}
        goToMenu={goToMenu}
        renderLightbox={renderLightbox}
        renderHours={renderHours}
        {...props}
      />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: Platform.select({
      ios: scale(14),
      android: scale(14),
      web: isBrowser ? 16 : scale(14)
    }),
    padding: isTablet() ? scale(5) : 3
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default memo(SingleStore);
