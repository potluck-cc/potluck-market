import React, { memo, useState, useEffect, Fragment } from "react";
import {
  Linking,
  StatusBar,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { Colors, isIphoneXorAbove, isTablet, useTimer } from "common";
import { ButtonHeader, Display } from "common/components";
import { Text, Button } from "react-native-ui-kitten";
import ImageView from "react-native-image-view";
import { scale } from "react-native-size-matters";
import { Analytics } from "aws-amplify";

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

  return (
    <ScrollView style={styles.container}>
      <StatusBar hidden />

      <Display
        imageSource={store.storefrontImage}
        onImagePress={() => setIsImageModalVisible(true)}
        imagePressDisabled={!store || !store.storefrontImage}
        renderHeader={() => <ButtonHeader onBackBtnPress={() => goBack()} />}
        transition
        cards={[
          {
            cardStyle: styles.cardStyle,
            renderContent: () => {
              return (
                <Fragment>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`${store.link}`)}
                  >
                    <Text category="h2" style={styles.dispensaryName}>
                      {store.name}
                    </Text>
                  </TouchableOpacity>

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
                </Fragment>
              );
            }
          },
          {
            cardStyle: styles.cardStyle,
            renderContent: () => (
              <Fragment>
                <Text category="h2" style={styles.title}>
                  Hours
                </Text>
                {store.hours && renderHours(store.hours)}
              </Fragment>
            )
          }
        ]}
      />

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
    backgroundColor: Colors.gray
  },
  dispensaryName: {
    textAlign: "center",
    marginBottom: 5,
    fontSize: scale(28),
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
    fontSize: scale(24),
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
  },
  cardStyle: {
    justifyContent: "center",
    alignItems: "center"
  }
});

export default memo(SingleStore);
