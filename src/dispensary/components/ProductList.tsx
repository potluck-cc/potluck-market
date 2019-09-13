import React from "react";
import { StyleSheet } from "react-native";
import { List } from "react-native-ui-kitten";
import { Card, CardSize } from "common/components";

type ProductListProps = {
  products: import("@potluckmarket/louis").InventoryItem[];
  store: import("@potluckmarket/louis").Store;
  navigate: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >["navigate"];
  onScroll?: () => void;
};

export default function ProductList({
  products,
  navigate,
  onScroll,
  store
}: ProductListProps) {
  function renderItem({ item }) {
    const image = item.image ? item.image : store.logo ? store.logo : null;

    return (
      <Card
        title={item.product.name}
        description={item.strainType}
        imageSource={image}
        cardSize={CardSize.small}
        onPress={() => {
          navigate("Product", {
            product: item,
            options: item.options,
            isMenu: true,
            store
          });
        }}
      />
    );
  }

  return (
    <List
      renderItem={renderItem}
      style={styles.container}
      data={products}
      columnWrapperStyle={{ justifyContent: "space-around" }}
      numColumns={2}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%"
  }
});
