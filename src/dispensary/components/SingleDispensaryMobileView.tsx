import React from "react";
import {
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Platform,
  View
} from "react-native";
import { Text } from "@ui-kitten/components";
import { Display, ButtonHeader } from "common/components";
import { Colors, isTablet } from "common";
import { scale } from "react-native-size-matters";
import { isBrowser } from "react-device-detect";

export default function SingleDispensaryMobileView({
  store,
  goToMenu,
  renderHours,
  goBack,
  onImagePress,
  renderLightbox
}) {
  return (
    <ScrollView style={styles.container}>
      <StatusBar hidden />

      <Display
        imageSource={
          store.storefrontImage
            ? store.storefrontImage
            : store.logo
              ? store.logo
              : null
        }
        onImagePress={() => onImagePress(true)}
        imagePressDisabled={!store || !store.storefrontImage}
        renderHeader={() => <ButtonHeader onBackBtnPress={goBack} />}
        transition
        renderMainBtn
        renderSvg={!store.storefrontImage && store.logo ? false : true}
        onBtnPress={goToMenu}
        renderContent={() => (
          <View style={styles.contentContainer}>
            <TouchableOpacity onPress={() => Linking.openURL(`${store.link}`)}>
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

            <Text category="h2" style={styles.title}>
              Hours
            </Text>
            {store.hours && renderHours(store.hours)}
          </View>
        )}
      />

      {store.storefrontImage ? renderLightbox() : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white"
  },
  contentContainer: {
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    textAlign: Platform.select({
      web: "center"
    })
  },
  dispensaryName: {
    textAlign: "center",
    marginBottom: 5,
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
    fontSize: scale(24),
    padding: isTablet() ? scale(5) : 0
  },
  informationContainer: {
    marginTop: 5,
    marginBottom: 10
  },
  text: {
    fontSize: Platform.select({
      ios: scale(14),
      android: scale(14),
      web: isBrowser ? 16 : scale(14)
    }),
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
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, .8)"
  }
});
