import React, { memo, useEffect, useState, useContext, Fragment } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  StatusBar,
  Platform
} from "react-native";
import { useLazyAppSyncQuery, OperationType } from "@potluckmarket/ella";
import { ListStores } from "queries";
import { List } from "react-native-ui-kitten";
import {
  Dimensions,
  Colors,
  isIphoneXorAbove,
  slugify,
  useDimensions,
  RNWebComponent,
  isTablet
} from "common";
import { Card, TextHeader } from "common/components";
import { isBrowser } from "react-device-detect";
import AppContext from "appcontext";

function DispensaryList(props: RNWebComponent) {
  const { client } = useContext(AppContext);

  const [dispensaries, loading, fetchDispensaries] = useLazyAppSyncQuery({
    client,
    operationType: OperationType.query,
    document: ListStores,
    fetchPolicy: "network-only"
  });

  const [refreshing, setRefreshing] = useState(false);

  const { dimensions, widthToDP } = useDimensions();

  const cardWidth = Platform.select({
    ios: widthToDP("80%"),
    android: widthToDP("80%"),
    web: isBrowser && !isTablet() ? widthToDP("30%") : widthToDP("75%")
  });

  const numOfItemsPerColumn = Math.floor(dimensions.width / (cardWidth + 40));

  useEffect(() => {
    initialize();
  }, []);

  function initialize() {
    fetchDispensaries();
  }

  function renderItem({
    item
  }: {
    item: import("@potluckmarket/types").Store;
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
        resizeMode={!item.storefrontImage && item.logo ? "contain" : null}
        containerStyle={{
          width: cardWidth,
          marginHorizontal: 10,
          marginVertical: 10,
          backgroundColor: !item.storefrontImage && item.logo ? "white" : null
        }}
        onPress={() => {
          if (Platform.OS === "web") {
            props.history.push(
              `/dispensary/usa-${item.state.toLowerCase()}-${item.city.toLowerCase()}/${
                item.slug
              }`,
              [{ store: item }]
            );
          } else {
            props.navigation.navigate("Store", {
              store: item
            });
          }
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
        data={
          dispensaries && dispensaries.listStores
            ? dispensaries.listStores.items
            : []
        }
        // data={stuff}
        renderItem={renderItem}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListFooterComponent={renderListFooterComponent}
        contentContainerStyle={styles.container}
        numColumns={Platform.select({
          ios: 1,
          android: 1,
          web: isBrowser ? numOfItemsPerColumn : 1
        })}
        key={Platform.select({
          ios: 1,
          android: 1,
          web: isBrowser ? numOfItemsPerColumn : 1
        })}
      />
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: Platform.select({
      web: "space-around"
    }),
    paddingTop: Platform.select({
      android: 30,
      ios: isIphoneXorAbove() ? 50 : 30
    }),
    backgroundColor: Colors.eggShell
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
