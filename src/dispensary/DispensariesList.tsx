import React, { memo, useEffect, useState, Fragment } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  StatusBar,
  Platform
} from "react-native";
import { useLazyAppSyncQuery, OperationType } from "@potluckmarket/ella";
import client from "client";
import { ListStores } from "queries";
import { List } from "react-native-ui-kitten";
import { Dimensions, Colors, isIphoneXorAbove } from "common";
import { Card, TextHeader } from "common/components";

type DispensariesListProps = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

function DispensaryList({ navigation: { navigate } }: DispensariesListProps) {
  const [dispensaries, loading, fetchDispensaries] = useLazyAppSyncQuery({
    client,
    operationType: OperationType.query,
    document: ListStores,
    fetchPolicy: "network-only"
  });

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  function initialize() {
    fetchDispensaries();
  }

  function renderItem({
    item
  }: {
    item: import("@potluckmarket/louis").Store;
    index: number;
  }) {
    const image = item.storefrontImage
      ? item.storefrontImage
      : item.logo
      ? item.logo
      : null;

    return (
      <Card
        imageSource={image}
        title={item.name}
        description={`${item.city}, ${item.state}`}
        onPress={() => {
          navigate("Store", {
            store: item
          });
        }}
      />
    );
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchDispensaries();
    setRefreshing(false);
  }

  function renderListFooterComponent() {
    if (loading) {
      return (
        <View style={styles.listFooter}>
          <ActivityIndicator animating size="small" />
        </View>
      );
    } else {
      return null;
    }
  }

  return (
    <Fragment>
      <StatusBar hidden />

      <List
        ListHeaderComponent={() => (
          <TextHeader title="Medical Cannabis" subtitle="Dispensaries" />
        )}
        data={dispensaries.listStores ? dispensaries.listStores.items : []}
        renderItem={renderItem}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListFooterComponent={renderListFooterComponent}
        contentContainerStyle={styles.container}
      />
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: Platform.select({
      android: 30,
      ios: isIphoneXorAbove() ? 50 : 30
    }),
    backgroundColor: Colors.eggShell,
    flex: 1
  },
  listItemImageBackground: {
    width: Dimensions.width,
    height: (200 / 375) * Dimensions.width,
    justifyContent: "center",
    alignItems: "center"
  },
  overlay: {
    justifyContent: "center",
    alignItems: "center",
    height: "50%"
  },
  listItemText: {
    color: "white"
  },
  listFooter: {
    paddingVertical: 20
  }
});

export default memo(DispensaryList);
