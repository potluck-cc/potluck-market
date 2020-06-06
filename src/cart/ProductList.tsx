import React from "react";
import { StyleSheet, View, ViewStyle, TextStyle, Platform } from "react-native";
import { Avatar, Badge } from "react-native-elements";
import { Text, List } from "@ui-kitten/components";
import { useSelector } from "react-redux";
import { CART_STATE } from "src/reducers/cart";
import { isMobile } from "react-device-detect";

type ProductListProps = {
  containerStyle?: ViewStyle;
  items?: import("@potluckmarket/types").InventoryItem[];
  listStyle?: ViewStyle;
  textStyle?: TextStyle;
  listKey?: string;
  totalContainerStyle?: ViewStyle;
  total?: string;
};

type ProductProps = {
  name: string;
  price: string;
  textStyle?: TextStyle;
  quantity: number;
  image: string | null;
  selectedWeight?: string;
  productType?: string;
};

function setFirsLetterInStringToUpper(str: string) {
  return str.replace(/^\w/, c => c.toUpperCase());
}

function Product({
  name,
  price,
  quantity,
  image,
  selectedWeight,
  productType,
  textStyle = {}
}: ProductProps) {
  return (
    <View style={styles.productContainer}>
      <View>
        <Avatar
          rounded
          source={
            image
              ? {
                  uri: image
                }
              : require("assets/images/potluck_logo.png")
          }
          size="small"
        />

        <Badge
          status="error"
          containerStyle={{ position: "absolute", top: -4, right: -4 }}
          value={quantity}
        ></Badge>
      </View>

      <Text style={[styles.productText, textStyle]}>{`${name} ${
        selectedWeight
          ? `- ${setFirsLetterInStringToUpper(selectedWeight)}`
          : ""
      } (${productType})`}</Text>

      <Text style={[styles.productText, textStyle]}>{price}</Text>
    </View>
  );
}

export default function({
  containerStyle,
  items = [],
  listStyle = {},
  textStyle = {},
  listKey,
  totalContainerStyle = {},
  total = "$0"
}: ProductListProps) {
  const {
    cart: { currentlyShoppingStore }
  } = useSelector<CART_STATE>(state => state);

  function renderProducts({
    item: { item, option, quantity }
  }: {
    index: number;
    item: import("@potluckmarket/types").OrderItem;
  }) {
    return (
      <Product
        name={item.product.name}
        price={item.isCannabisProduct ? `$${item.price}` : `$${option.amount}`}
        quantity={quantity}
        selectedWeight={item.isCannabisProduct ? undefined : option.weight}
        productType={item.productType}
        image={
          item.product.image
            ? item.product.image
            : currentlyShoppingStore
            ? currentlyShoppingStore.logo
            : null
        }
        textStyle={textStyle}
      />
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {items.length < 1 ? (
        <Text
          style={[
            styles.totalText,
            textStyle,
            listStyle,
            { textAlign: "center" }
          ]}
        >
          There are no items in your cart!
        </Text>
      ) : (
        <List
          data={items}
          renderItem={renderProducts}
          style={[{ backgroundColor: "transparent" }, listStyle]}
          contentContainerStyle={{
            alignItems: Platform.select({
              web: isMobile ? undefined : "center"
            })
          }}
          listKey={listKey}
        />
      )}
      <View style={[styles.totalContainer, totalContainerStyle]}>
        <Text category="h6" style={[styles.totalText, textStyle]}>
          Total:
        </Text>
        <Text category="h4" style={[styles.totalText, textStyle]}>
          {total || `$${0}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  productContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
    width: Platform.select({
      web: isMobile ? undefined : "35vw"
    })
  },
  productText: {
    color: "white"
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "white",
    paddingHorizontal: Platform.select({
      web: isMobile ? undefined : 100
    })
  },
  totalText: {
    color: "white"
  }
});
