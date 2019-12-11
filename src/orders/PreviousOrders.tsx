import React, { useState, useEffect, useContext, Fragment } from "react";
import AppContext from "appcontext";
import {
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { List, Text } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";
import { RNWebComponent, Colors, isTablet } from "common";
import OrderCard from "./OrderCard";
import { ProductList } from "cart";
import { Modal } from "common/components";
import { isBrowser, isMobile } from "react-device-detect";
import { OperationType, useLazyAppSyncQuery } from "@potluckmarket/ella";
import { GetOrders } from "queries";
import { Signin } from "auth";

export default function(props: RNWebComponent) {
  const { client, currentAuthenticatedUser } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [isReceiptModalVisible, setIsReceiptModalVisible] = useState(false);
  const [activeOrder, setActiveOrder] = useState<
    import("@potluckmarket/types").Order | null
  >(null);

  const [res, loading, fetchOrders] = useLazyAppSyncQuery({
    client,
    document: GetOrders,
    operationType: OperationType.query,
    fetchPolicy: "network-only"
  });

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    initialize();
  }, [currentAuthenticatedUser]);

  useEffect(() => {
    if (res && res.getOrdersByCustomer && res.getOrdersByCustomer.items) {
      setOrders(currentItems => [
        ...currentItems,
        ...res.getOrdersByCustomer.items
      ]);
    }
  }, [res]);

  function initialize() {
    if (currentAuthenticatedUser) {
      fetchOrders({
        customerId: currentAuthenticatedUser.id
      });
    }
  }

  function renderOrders({
    item,
    index
  }: {
    index: number;
    item: import("@potluckmarket/types").Order;
  }) {
    return (
      <OrderCard
        listKey={String(index)}
        order={item}
        onPress={() => {
          setActiveOrder(item);
          setIsReceiptModalVisible(true);
        }}
      />
    );
  }

  if (!currentAuthenticatedUser) {
    return <Signin {...props} />;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={Colors.green} />
      </View>
    );
  }

  if (
    !loading &&
    res &&
    res.getOrdersByCustomer &&
    !res.getOrdersByCustomer.items.length
  ) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>You haven't made any orders yet!</Text>
      </View>
    );
  }

  return (
    <Fragment>
      <List
        data={orders}
        renderItem={renderOrders}
        contentContainerStyle={styles.container}
        onEndReached={() => {
          if (
            res &&
            res.getOrdersByCustomer &&
            res.getOrdersByCustomer.nextToken
          ) {
            fetchOrders(res.getOrdersByCustomer.nextToken);
          }
        }}
      />

      <Modal
        isVisible={isReceiptModalVisible}
        style={{
          padding: isBrowser ? undefined : 0,
          margin: isBrowser ? undefined : 0
        }}
      >
        {activeOrder ? (
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setIsReceiptModalVisible(false)}>
                <Icon
                  color="black"
                  size={30}
                  name="close"
                  type="material-community"
                />
              </TouchableOpacity>
            </View>

            <Text category="h5">ORDER RECEIPT</Text>
            <Text category="h6">{`#${activeOrder.code}`}</Text>

            <ProductList
              items={activeOrder.products}
              total={activeOrder.totalDisplayValue}
              containerStyle={{
                height: "80%",
                width: Platform.select({
                  web: isBrowser && isMobile ? "75%" : "100%",
                  default: isTablet() ? "75%" : "100%"
                })
              }}
              listStyle={{
                maxHeight: "70%",
                overflow: "hidden"
              }}
              textStyle={{ color: "black" }}
              listKey={activeOrder.id}
            />
          </View>
        ) : (
          <View />
        )}
      </Modal>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ddd",
    alignItems: Platform.select({
      default: isTablet() ? "center" : null,
      web: (isBrowser && "center") || null
    }),
    minHeight: "100%"
  },
  header: {
    width: "100%",
    alignItems: "flex-end",
    justifyContent: "flex-end"
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    paddingVertical: 5
  },
  modalContainer: {
    flex: 1,
    height: "100%",
    width: Platform.select({
      default: "100%",
      web: (isBrowser && "50%") || "100%"
    }),
    backgroundColor: "white",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    padding: 10,
    zIndex: 999
  }
});
