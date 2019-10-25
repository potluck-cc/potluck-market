import React, { memo, useState, useEffect, lazy, Suspense } from "react";
import { StyleSheet, View, Platform, ActivityIndicator } from "react-native";
import { Text } from "react-native-ui-kitten";
import { Colors, isTablet, useTimer, RNWebComponent } from "common";
import { Graph, Lightbox } from "./components";
import { ProductType } from "@potluckmarket/louis";
import { scale, moderateScale } from "react-native-size-matters";
import { Analytics } from "aws-amplify";
import { isBrowser } from "react-device-detect";

interface ProductProps extends RNWebComponent {
  product?: import("@potluckmarket/louis").InventoryItem;
  store?: import("@potluckmarket/louis").Store;
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1, color = "17, 32, 33") => `rgba(${color}, ${opacity})`,
  strokeWidth: 2
};

const Layout = lazy(() =>
  Platform.OS === "web"
    ? isBrowser
      ? import("./components/ProductWebView")
      : import("./components/ProductMobileView")
    : import("./components/ProductMobileView")
);

export default memo(function Product(props: ProductProps) {
  const product: import("@potluckmarket/louis").InventoryItem =
    Platform.OS === "web"
      ? props.location.state[0].product || props.product
      : props.navigation.getParam("product", null);

  const store: import("@potluckmarket/louis").Store =
    Platform.OS === "web"
      ? props.location.state[0].store || props.store
      : props.navigation.getParam("store", {});

  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

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

  function renderLightbox() {
    let images = [];

    if (Platform.OS === "web") {
      images = [product.image];
    } else {
      images = [
        {
          source: {
            uri: product.image
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
      product.productType === ProductType.Edible ||
      product.productType === ProductType.Concentrate
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
      <View style={styles.graphContainer}>
        <Graph
          data={data}
          width={300}
          height={moderateScale(220)}
          chartConfig={chartConfig}
          style={{ backgroundColor: "transparent" }}
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
      </View>
    );
  }

  function goBack() {
    if (Platform.OS === "web") {
      props.history.goBack();
    } else {
      props.navigation.goBack();
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
        product={product}
        renderLightbox={renderLightbox}
        renderCannabinoidProfile={renderCannabinoidProfile}
        styles={styles}
        goBack={goBack}
        onImagePress={() => setIsImageModalVisible(true)}
        {...props}
      />
    </Suspense>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.gray
  },
  productName: {
    fontSize: scale(20),
    padding: Platform.select({
      ios: isTablet() ? scale(12) : 0
    }),
    marginBottom: 10,
    textAlign: "center"
  },
  productStrainType: {
    fontSize: Platform.select({
      ios: scale(18),
      android: scale(14),
      web: scale(20)
    }),
    padding: isTablet() ? scale(10) : 4
  },
  pagesContainer: {
    backgroundColor: "white"
  },
  page: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    overflow: "hidden"
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
  graphContainer: {
    flexDirection: Platform.select({
      web: "column"
    }),
    alignItems: "center"
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
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
