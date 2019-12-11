import React, { memo } from "react";
import { StyleSheet, Platform, RefreshControl } from "react-native";
import { List, Text } from "react-native-ui-kitten";
import { Card, CardSize } from "common/components";
import { useDimensions, isTablet } from "common";
import { isBrowser, isMobile } from "react-device-detect";

type ProductListProps = {
  products: import("@potluckmarket/types").InventoryItem[] | [];
  store: import("@potluckmarket/types").Store;
  navigate:
    | import("react-navigation").NavigationScreenProp<
        import("react-navigation").NavigationState,
        import("react-navigation").NavigationParams
      >["navigate"]
    | null;
  onScroll?: () => void;
  openModal?: (
    item: import("@potluckmarket/types").InventoryItem
  ) => void | null;
  header: JSX.Element;
  footer: JSX.Element;
  onEndReached: () => void;
  refetching: boolean;
};

export default function ProductList({
  products,
  navigate,
  onScroll,
  store,
  openModal = () => {},
  header,
  footer,
  onEndReached = () => {},
  refetching
}: ProductListProps) {
  const { dimensions, heightToDP, widthToDP } = useDimensions();

  const styles = StyleSheet.create({
    container: {
      height: Platform.select({
        web: heightToDP("100%"),
        default: "100%"
      }),
      flex: 1,
      marginBottom: Platform.select({
        ios: 110,
        android: 110
      })
    }
  });

  const cardWidth =
    Platform.OS === "web" && isBrowser && !isTablet()
      ? widthToDP("25%")
      : widthToDP("45%");

  const numberOfItems = Math.round(dimensions.width / cardWidth);

  const maximumNumberOfItems = 3;

  function renderItem({ item, index }) {
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
          height: heightToDP("40%")
        }}
        onPress={() => {
          if (Platform.OS === "web") {
            openModal(item);
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
      onEndReached={() => {}}
      maxToRenderPerBatch={6}
      columnWrapperStyle={{
        justifyContent: "space-around"
      }}
      numColumns={
        numberOfItems > maximumNumberOfItems
          ? maximumNumberOfItems
          : numberOfItems
      }
      keyExtractor={item => item.id}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      refreshing={refetching}
      refreshControl={<RefreshControl refreshing={refetching} />}
    />
  );
}
