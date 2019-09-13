import React, { Fragment, memo } from "react";
import { View, StyleSheet, Text } from "react-native";
import { ProductList } from "./components";
import { Topbar } from "common/components";
import { scale } from "react-native-size-matters";

type SearchResultsProps = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

const SearchResults = ({ navigation }: SearchResultsProps) => {
  const searchQuery = navigation.getParam("searchQuery", null);
  const products = navigation.getParam("products", []);
  const store = navigation.getParam("store", {});

  const filteredProducts = products.length
    ? products.filter(product =>
        product.product.searchField.includes(
          searchQuery.replace(/ /g, "_").toLowerCase()
        )
      )
    : [];

  return (
    <Fragment>
      <Topbar
        navigation={navigation}
        title={`Showing results for: ${searchQuery}`}
      />
      {filteredProducts.length ? (
        <ProductList
          products={filteredProducts}
          navigate={navigation.navigate}
          onScroll={() => {}}
          store={store}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Text
            style={styles.noResultsText}
          >{`No results found for "${searchQuery}"`}</Text>
        </View>
      )}
    </Fragment>
  );
};

const styles = StyleSheet.create({
  noResultsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  noResultsText: {
    textAlign: "center",
    fontSize: scale(14)
  }
});

export default memo(SearchResults);
