import React, { memo, Fragment, useState, useEffect } from "react";
import { StyleSheet, Image, View, Platform, ScrollView } from "react-native";
import { Text } from "react-native-ui-kitten";
import {
  Dimensions,
  Colors,
  isIphoneXorAbove,
  isTablet,
  useTimer
} from "common";
import { ButtonHeader, Display } from "common/components";
import { Graph } from "./components";
import ImageView from "react-native-image-view";
import { Image as CacheImage } from "react-native-expo-image-cache";
import { ProductType } from "@potluckmarket/louis";
import { scale, moderateScale } from "react-native-size-matters";
import { Analytics } from "aws-amplify";

type ProductProps = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1, color = "17, 32, 33") => `rgba(${color}, ${opacity})`,
  strokeWidth: 2
};

export default memo(function Product({
  navigation: { getParam, goBack }
}: ProductProps) {
  const product: import("@potluckmarket/louis").InventoryItem = getParam(
    "product",
    null
  );
  const store: import("@potluckmarket/louis").Store = getParam("store", null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  const images = [
    {
      source: {
        uri: product && product.image ? product.image : null
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

  function buildAnalyticsAttributes() {
    let attributes = {};

    if (product) {
      attributes["productType"] = product.productType;
      attributes["strainType"] = product.strainType;

      if (product.product && product.product.name) {
        attributes["productName"] = product.product.name;
      }
    }

    return attributes;
  }

  async function recordPageVisit(visitTime: number) {
    const attributes = await buildAnalyticsAttributes();

    Analytics.record({
      name: "productVisit",
      attributes,
      metrics: {
        secondsBrowsed: visitTime
      }
    });
  }

  function buildGraphDataObject(
    productType?: ProductType
  ): { data: number[]; colors: string[] } {
    const data = {
      data: [],
      colors: []
    };

    const maxTHC: number = productType === ProductType.Concentrate ? 100 : 40;
    const maxCBD: number = productType === ProductType.Concentrate ? 100 : 25;

    if (product.cbd) {
      data.data = [...data.data, product.cbd / maxCBD];
      data.colors = [...data.colors, Colors.cbd];
    }

    if (product.thc) {
      data.data = [...data.data, product.thc / maxTHC];
      data.colors = [...data.colors, Colors.thc];
    }

    return data;
  }

  function renderCannabinoidProfile() {
    if (!product || (!product.thc && !product.cbd)) {
      <Text style={{ marginTop: 10 }}>No lab results available.</Text>;
    }

    if (
      product.productType === ProductType.Topical ||
      product.productType === ProductType.Edible
    ) {
      return (
        <View
          style={{
            marginTop: 10,
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {product.thc && (
            <View
              style={{
                flexDirection: "row",
                marginTop: 10
              }}
            >
              <Text
                category="h3"
                style={{ color: `rgb(${Colors.thc})` }}
              >{`${product.thc} MG`}</Text>
              <Text category="c2">THC</Text>
            </View>
          )}

          {product.cbd && (
            <View
              style={{
                flexDirection: "row",
                marginTop: 10
              }}
            >
              <Text
                category="h3"
                style={{ color: `rgb(${Colors.cbd})` }}
              >{`${product.cbd} MG`}</Text>
              <Text category="c2">CBD</Text>
            </View>
          )}
        </View>
      );
    }

    const data = buildGraphDataObject(product.productType);

    return (
      <Fragment>
        <Graph
          data={data}
          width={300}
          height={moderateScale(220)}
          chartConfig={chartConfig}
        />

        <View style={styles.legendContainer}>
          {product.thc && (
            <View style={styles.dataPoint}>
              <View
                style={[
                  styles.colorIndicator,
                  { backgroundColor: `rgb(${Colors.thc})` }
                ]}
              />
              <Text style={styles.dataText}>{`THC ${product.thc}%`}</Text>
            </View>
          )}

          {product.cbd && (
            <View style={styles.dataPoint}>
              <View
                style={[
                  styles.colorIndicator,
                  { backgroundColor: `rgb(${Colors.cbd})` }
                ]}
              />
              <Text style={styles.dataText}>{`CBD ${product.cbd}%`}</Text>
            </View>
          )}
        </View>
      </Fragment>
    );
  }

  function renderImageHeader() {
    const image =
      product && product.image
        ? product.image
        : store && store.logo
        ? store.logo
        : null;

    if (image) {
      const uri = image;
      const preview = { uri: image };

      return (
        <CacheImage
          resizeMode="contain"
          style={styles.image}
          {...{ preview, uri }}
        />
      );
    } else {
      return (
        <Image
          resizeMode="contain"
          style={styles.image}
          source={require("assets/images/potluck_default.png")}
        />
      );
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Display
        imageSmall
        imageSource={
          product && product.image
            ? product.image
            : store && store.logo
            ? store.logo
            : null
        }
        onImagePress={() => setIsImageModalVisible(true)}
        imagePressDisabled={!product || !product.image}
        renderHeader={() => <ButtonHeader onBackBtnPress={() => goBack()} />}
        cards={[
          {
            cardStyle: styles.page,
            renderContent: () => (
              <Fragment>
                <Text category="h6" style={styles.productName}>
                  {product.product.name}
                </Text>
                <Text category="c1" style={styles.productStrainType}>
                  {product.strainType}
                </Text>
                {product.description && (
                  <Text style={styles.description}>{product.description}</Text>
                )}
              </Fragment>
            )
          },
          {
            cardStyle: styles.page,
            renderContent: () => (
              <Fragment>{renderCannabinoidProfile()}</Fragment>
            )
          }
        ]}
      />

      {product && product.image && (
        <ImageView
          images={images}
          imageIndex={0}
          isVisible={isImageModalVisible}
          onClose={() => setIsImageModalVisible(false)}
        />
      )}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.gray
  },
  image: {
    width: Dimensions.width,
    height: Dimensions.width
  },
  panelContainer: {
    top: Dimensions.height - 30,
    bottom: 200
  },
  panel: {
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    padding: 25,
    width: Dimensions.width,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "column",
    shadowOffset: { width: 1, height: 0 },
    shadowColor: "black",
    shadowOpacity: 0.2,
    backgroundColor: "#F4F8FB"
  },
  wrapper: {},
  panelPrimaryContentWrapper: {
    marginBottom: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },
  panelIconContainer: {
    marginBottom: 10,
    width: Dimensions.width
  },
  productName: {
    fontSize: Platform.select({
      ios: scale(20),
      android: scale(20)
    }),
    padding: Platform.select({
      ios: isTablet() ? scale(12) : 0
    }),
    marginBottom: 10,
    textAlign: "center"
  },
  productStrainType: {
    fontSize: Platform.select({
      ios: scale(18),
      android: scale(14)
    }),
    padding: isTablet() ? scale(10) : 4
  },
  pagesContainer: {
    backgroundColor: "white"
  },
  page: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10
  },
  title: {
    fontSize: scale(18),
    padding: isTablet() ? scale(12) : 0,
    marginBottom: 10
  },
  description: {
    fontSize: scale(16),
    padding: isTablet() ? scale(13) : 0,
    lineHeight: scale(20),
    textAlign: "center",
    paddingTop: 10
  },
  dataText: {
    fontSize: scale(16),
    padding: isTablet() ? scale(8) : 0
  },
  legendContainer: {
    alignItems: "flex-start",
    justifyContent: "space-evenly"
  },
  dataPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
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
