import React, {
  memo,
  useState,
  useEffect,
  Suspense,
  useContext,
  lazy
} from "react";
import AppContext from "appcontext";
import { View, Platform, ActivityIndicator, StyleSheet } from "react-native";
import { useTimer, slugify, RNWebComponent, Colors, isTablet } from "common";
import { Text } from "react-native-ui-kitten";
import { Analytics } from "aws-amplify";
import { Lightbox } from "common/components";
import { isBrowser } from "react-device-detect";
import { scale } from "react-native-size-matters";
import { appsyncFetch, OperationType } from "@potluckmarket/ella";
import { FindStoreByMetadata } from "queries";
import { getStoreWithMetadata } from "./functions";

const Layout = lazy(() =>
  Platform.OS === "web"
    ? isBrowser && !isTablet()
      ? import("./components/SingleDispensaryWebView")
      : import("./components/SingleDispensaryMobileView")
    : import("./components/SingleDispensaryMobileView")
);

function SingleStore(props: RNWebComponent) {
  const { client } = useContext(AppContext);

  const storeFromState: import("@potluckmarket/types").Store =
    Platform.OS === "web"
      ? (props.location.state &&
          props.location.state.length &&
          props.location.state[0].store) ||
        null
      : props.navigation.getParam("store", null);

  const [store, setStore] = useState(storeFromState);

  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  const date = new Date();

  const { start, end } = useTimer();

  useEffect(() => {
    start();
    initialize();

    return () => {
      const visitTime = end();
      // recordPageVisit(visitTime);
    };
  }, []);

  async function initialize() {
    if (!store) {
      let metadata;

      if (Platform.OS === "web") {
        const {
          match: {
            params: { location, slug }
          }
        } = props;
        metadata = `${location}-${slug}`;
      }

      await getStoreWithMetadata({
        metadata,
        client,
        onSuccess: store => setStore(store),
        onFailure: () => {
          if (Platform.OS === "web") {
            props.history.push("/");
          }
        }
      });
    }
  }

  function recordPageVisit(visitTime: number) {
    // if (store && store.name) {
    //   Analytics.record({
    //     name: "dispensaryVisit",
    //     attributes: {
    //       dispensaryName: store.name
    //     },
    //     metrics: {
    //       secondsBrowsed: visitTime
    //     }
    //   });
    // } else {
    //   Analytics.record({
    //     name: "dispensaryVisit",
    //     metrics: {
    //       secondsBrowsed: visitTime
    //     }
    //   });
    // }
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

  function goBack() {
    if (Platform.OS === "web") {
      props.history.push("/");
    } else {
      props.navigation.goBack();
    }
  }

  function onImagePress() {
    setIsImageModalVisible(true);
  }

  function goToMenu() {
    if (Platform.OS === "web") {
      props.history.push(
        `/dispensary/usa-${store.state.toLowerCase()}-${store.city.toLowerCase()}/${
          store.slug
        }/menu`,
        [{ store }]
      );
    } else {
      props.navigation.navigate("Menu", {
        menu: true,
        store
      });
    }
  }

  if (!store) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={Colors.green} />
      </View>
    );
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
        renderLightbox={() => (
          <Lightbox
            images={[store.storefrontImage]}
            isImageModalVisible={isImageModalVisible}
            close={() => setIsImageModalVisible(false)}
          />
        )}
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
