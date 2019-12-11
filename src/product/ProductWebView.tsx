import React from "react";
import { View, Image, StyleSheet, Platform, ScrollView } from "react-native";
import { Text } from "react-native-ui-kitten";
import { scale } from "react-native-size-matters";
import { isBrowser } from "react-device-detect";
import { useDimensions, isTablet } from "common";

export default function ProductWebView({
  product,
  renderCannabinoidProfile,
  store
}) {
  const { widthToDP, heightToDP } = useDimensions();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F7F9FC",
      paddingVertical: 100,
      paddingHorizontal: 25,
      alignItems: "center",
      overflow: "hidden"
    },
    image: {
      width: isTablet() ? widthToDP("60%") : widthToDP("30%"),
      height: heightToDP("50%"),
      borderRadius: 15,
      boxShadow: "1px 3px 20px 1px rgba(0,0,0,.4)"
    },
    description: {
      // width: widthToDP("50%"),
      padding: 50,
      alignItems: "center"
    },
    subtitle: {
      fontSize: 18,
      lineHeight: 28,
      paddingTop: 15
    },
    graph: {
      justifyContent: "center",
      alignItems: "center"
    },
    graphContainer: {
      flexDirection: Platform.select({
        web: "column"
      }),
      alignItems: "flex-start"
    },
    dataText: {
      fontSize: Platform.select({
        ios: scale(16),
        android: scale(16),
        web: isBrowser ? 18 : scale(16)
      }),
      padding: Platform.select({
        ios: isTablet() ? scale(8) : 0,
        android: isTablet() ? scale(8) : 0,
        web: 0
      })
    },
    legendContainer: {
      alignItems: "flex-start",
      justifyContent: Platform.select({
        ios: "space-evenly",
        android: "space-evenly",
        web: isBrowser ? "center" : "space-evenly"
      })
    },
    dataPoint: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5
    },
    colorIndicator: {
      borderRadius: 50,
      backgroundColor: "rgb(37, 196, 207)",
      height: scale(16),
      width: scale(16),
      marginRight: 10
    }
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={
          product.image
            ? { uri: product.image }
            : store.logo
            ? { uri: store.logo }
            : require("assets/images/potluck_logo.png")
        }
        style={styles.image}
        resizeMode={product.image ? "cover" : store.logo ? "contain" : null}
      />
      <View style={styles.description}>
        <Text category="h3">{product.product.name}</Text>
        <Text category="s1" style={{ fontSize: 18 }}>
          {product.strainType === "CBD" ? "High CBD" : product.strainType}
        </Text>
        <Text category="c1" style={styles.subtitle}>
          {product.description}
        </Text>

        <View style={styles.graph}>{renderCannabinoidProfile()}</View>
      </View>
    </ScrollView>
  );
}
