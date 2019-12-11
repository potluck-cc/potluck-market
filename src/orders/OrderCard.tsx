import React from "react";
import { StyleSheet, View, Image, Platform } from "react-native";
import { Text } from "react-native-ui-kitten";
import { useDimensions, isTablet } from "common";
import { Divider, GenericButton } from "common/components";
import { ProductList } from "cart";
import { isBrowser, isMobile } from "react-device-detect";
import moment from "moment";
import { dateFormat } from "@potluckmarket/ella";

type OrderCardProps = {
  listKey?: string;
  onPress?: Function;
  order: import("@potluckmarket/types").Order;
};

export default function({
  listKey,
  order,
  onPress = () => {}
}: OrderCardProps) {
  const { widthToDP, heightToDP, isLandscape } = useDimensions();

  function generateStatusColor(status) {
    return status === "new" ? "orange" : status === "rejected" ? "red" : "blue";
  }

  return (
    <View
      style={[
        styles.container,
        {
          height: isLandscape
            ? isMobile
              ? heightToDP("150%")
              : heightToDP("65%")
            : heightToDP("80%"),
          width: Platform.select({
            default: isTablet() ? widthToDP("70%") : widthToDP("100%"),
            web: (isBrowser && widthToDP("50%")) || widthToDP("100%")
          })
        }
      ]}
    >
      <View style={styles.orderDetailsSection}>
        <Image
          source={
            order.store.logo
              ? {
                  uri: order.store.logo
                }
              : require("assets/images/potluck_logo.png")
          }
          style={styles.image}
          resizeMode="contain"
        />

        <Text>{order.store.name}</Text>

        <View style={styles.orderStatusContainer}>
          <View
            style={[
              styles.statusIndicator,
              {
                borderColor: generateStatusColor(order.status),
                backgroundColor: generateStatusColor(order.status)
              }
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: generateStatusColor(order.status) }
            ]}
          >
            {order.status === "new" ? "pending" : order.status}
          </Text>
        </View>

        <Text>{moment(order.createdAt).format(dateFormat)}</Text>

        <Divider style={{ margin: 5, width: "60%" }} />
      </View>

      <View style={styles.productListSection}>
        <ProductList
          items={order.products}
          total={order.totalDisplayValue}
          containerStyle={{
            height: "85%",
            width: "100%"
          }}
          listStyle={{
            maxHeight: 100,
            overflow: "hidden"
          }}
          textStyle={{ color: "black" }}
          listKey={listKey}
        />
      </View>

      <View style={styles.actionsSection}>
        <GenericButton buttonText="View Receipt" onPress={onPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    backgroundColor: "white",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    overflow: "hidden"
  },
  image: {
    width: "95%",
    height: 100,
    marginBottom: 5
  },
  orderDetailsSection: {
    height: "40%",
    width: "100%",
    alignItems: "center"
  },
  orderStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5
  },
  statusIndicator: {
    height: 10,
    width: 10,
    borderWidth: 1,
    borderRadius: 100,
    marginRight: 5
  },
  statusText: {
    textTransform: "uppercase"
  },
  productListSection: {
    height: "40%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative"
  },
  actionsSection: {
    height: "20%",
    alignItems: "center",
    justifyContent: "center"
  }
});
