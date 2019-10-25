import React from "react";
import { StyleSheet, Platform } from "react-native";
import { List } from "react-native-ui-kitten";
import { Card, CardSize } from "common/components";
import { useDimensions, isTablet } from "common";
import { isBrowser, isMobile } from "react-device-detect";

type ProductListProps = {
  products: import("@potluckmarket/louis").InventoryItem[];
  store: import("@potluckmarket/louis").Store;
  navigate: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >["navigate"];
  onScroll?: () => void;
  openModal?: (item: import("@potluckmarket/louis").InventoryItem) => void;
};

export default function ProductList({
  products,
  navigate,
  onScroll,
  store,
  openModal = () => {}
}: ProductListProps) {
  const { dimensions, heightToDP, widthToDP } = useDimensions();

  const styles = StyleSheet.create({
    container: {
      height: Platform.select({
        web: heightToDP("100%"),
        android: "100%"
      }),
      flex: 1,
      marginBottom: Platform.select({
        ios: 50,
        android: 50
      })
    }
  });

  const cardWidth =
    Platform.OS === "web" && isBrowser && !isTablet()
      ? widthToDP("25%")
      : widthToDP("45%");

  const numberOfItems = Math.round(dimensions.width / cardWidth);

  const maximumNumberOfItems = 3;

  function renderItem({ item }) {
    const image = item.image ? item.image : store.logo ? store.logo : null;

    return (
      <Card
        title={item.product.name}
        description={item.strainType === "CBD" ? "High CBD" : item.strainType}
        imageSource={image}
        resizeMode={item.image ? null : store.logo ? "contain" : null}
        cardSize={CardSize.small}
        containerStyle={{
          width: cardWidth,
          height: Platform.select({
            web: heightToDP("60%"),
            android: heightToDP("40%"),
            ios: heightToDP("40%")
          })
        }}
        onPress={() => {
          if (Platform.OS === "web") {
            if (isMobile) {
              console.log(item);
              navigate(
                isBrowser
                  ? `/menu/product/${item.product.slug}`
                  : `/product/${item.product.slug}`,
                {
                  store,
                  product: item
                }
              );
            } else {
              openModal(item);
            }
          } else {
            navigate("Product", {
              product: item,
              options: item.options,
              isMenu: true,
              store
            });
          }
        }}
      />
    );
  }

  return (
    <List
      renderItem={renderItem}
      style={styles.container}
      data={products}
      onEndReachedThreshold={0.5}
      maxToRenderPerBatch={6}
      columnWrapperStyle={{
        justifyContent: "space-around"
      }}
      numColumns={
        numberOfItems > maximumNumberOfItems
          ? maximumNumberOfItems
          : numberOfItems
      }
    />
  );
}
