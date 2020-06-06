import React, { memo, useEffect, useState, useContext, Fragment } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  StatusBar,
  Platform,
  SafeAreaView
} from "react-native";
import { useLazyAppSyncQuery, OperationType } from "@potluckmarket/ella";
import { ListStores, generateStoreFilterQuery } from "queries";
import { List, Text, Input } from "@ui-kitten/components";
import {
  Dimensions,
  Colors,
  useDimensions,
  RNWebComponent,
  isTablet,
  getLocationPermissions,
  getLocationAsync
} from "common";
import { Card, GenericButton } from "common/components";
import { isBrowser, isMobile } from "react-device-detect";
import AppContext from "appcontext";
import { DispensaryListFilter } from "./components";
import { moderateScale } from "react-native-size-matters";

const distances = [
  { text: "5mi" },
  { text: "10mi" },
  { text: "15mi" },
  { text: "20mi" },
  { text: "30mi" },
  { text: "40mi" },
  { text: "50mi" }
];

const defaultFilterState = {
  pickup: false,
  delivery: false,
  distance: distances[0]
};

function DispensaryList(props: RNWebComponent) {
  const { client } = useContext(AppContext);

  const [refreshing, setRefreshing] = useState(false);

  const { dimensions, widthToDP } = useDimensions();

  const cardWidth = Platform.select({
    ios: widthToDP("80%"),
    android: widthToDP("80%"),
    web: isBrowser && !isTablet() ? widthToDP("30%") : widthToDP("75%")
  });

  const numOfItemsPerColumn = Math.floor(dimensions.width / (cardWidth + 40));

  const [initComplete, isInitComplete] = useState(false);

  const [filterState, updateFilterState] = useState(defaultFilterState);

  const [locationPermissionDenied, setLocationPermissionDenied] = useState(
    false
  );

  const [zip, setZip] = useState("");

  const [geolocation, setGeolocation] = useState(null);

  const [dispensaries, loading, fetchDispensaries] = useLazyAppSyncQuery({
    client,
    operationType: OperationType.query,
    document:
      filterState.pickup || filterState.delivery
        ? generateStoreFilterQuery({
            delivery: filterState.delivery,
            pickup: filterState.pickup
          })
        : ListStores,
    fetchPolicy: "network-only"
  });

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    initialize();
  }, [
    filterState.distance,
    filterState.delivery,
    filterState.pickup,
    geolocation
  ]);

  async function initialize() {
    if (geolocation) {
      await fetchDispensaries({
        lat: geolocation.latitude,
        lng: geolocation.longitude,
        distance: filterState.distance.text,
        delivery: filterState.delivery,
        pickup: filterState.pickup
      });

      isInitComplete(true);
    } else {
      // setLocationPermissionDenied(true);

      await getLocationPermissions({
        onSuccess: async () => {
          await getLocationAsync({
            onSuccess: async location => {
              await fetchDispensaries({
                lat: location.latitude,
                lng: location.longitude,
                distance: filterState.distance.text,
                delivery: filterState.delivery,
                pickup: filterState.pickup
              });

              isInitComplete(true);
            },
            coordsOnly: true
          });
        },
        onFail: () => {
          setLocationPermissionDenied(true);
        }
      });
    }
  }

  async function locateByZip() {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}}&key=AIzaSyB30Evgnn_D16ZtL5qCRFzUJrj5sGY2dUo`;

    const res = await fetch(url);

    const { results } = (await res.json()) || null;

    if (results && results.length) {
      const loc = results[0].geometry.location;
      setGeolocation({ latitude: loc.lat, longitude: loc.lng });
    }
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
    await initialize();
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

  if (loading) {
    return (
      <SafeAreaView>
        <DispensaryListFilter
          filterState={filterState}
          updateFilterState={updateFilterState}
          distances={distances}
        />

        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <StatusBar barStyle="dark-content" animated />

          <ActivityIndicator animating size="small" color={Colors.medGreen} />
        </View>
      </SafeAreaView>
    );
  }

  if (
    initComplete &&
    !loading &&
    dispensaries &&
    dispensaries.geosearchStores &&
    !dispensaries.geosearchStores.length
  ) {
    return (
      <SafeAreaView>
        <View>
          <StatusBar barStyle="dark-content" animated />

          <DispensaryListFilter
            filterState={filterState}
            updateFilterState={updateFilterState}
            distances={distances}
          />

          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 20
            }}
          >
            <Text style={{ textAlign: "center", fontSize: moderateScale(12) }}>
              No dispensaries were found. Please try adjusting your search
              criteria.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (locationPermissionDenied && !dispensaries.geosearchStores) {
    return (
      <SafeAreaView>
        <View
          style={{
            padding: 25,
            alignItems: "center",
            justifyContent: Platform.select({
              web: "space-between",
              ios: "center",
              android: "center"
            }),
            flex: Platform.select({
              web: undefined,
              default: 1
            })
          }}
        >
          <StatusBar barStyle="dark-content" animated />

          <Text style={{ textAlign: "center", fontSize: moderateScale(12) }}>
            We're unable to locate you. Please enter your zip code below so that
            we can find dispensaries near you.
          </Text>

          <Input
            placeholder={"07205"}
            style={{ marginVertical: 25 }}
            value={zip}
            onChangeText={text => setZip(text)}
          />

          <GenericButton buttonText="Locate Me" onPress={() => locateByZip()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <StatusBar barStyle="dark-content" animated />

      <List
        ListHeaderComponent={
          <DispensaryListFilter
            filterState={filterState}
            updateFilterState={updateFilterState}
            distances={distances}
          />
        }
        data={
          dispensaries && dispensaries.geosearchStores
            ? dispensaries.geosearchStores
            : []
        }
        renderItem={renderItem}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListFooterComponent={renderListFooterComponent}
        stickyHeaderIndices={[0]}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: Platform.select({
      web: "space-around"
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
