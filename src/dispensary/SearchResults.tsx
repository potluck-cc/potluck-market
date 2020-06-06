import React, { Fragment, memo, useState } from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import { ProductList } from "./components";
import { stackHistory, slugify, RNWebComponent } from "common";
import { Topbar } from "common/components";
import { scale } from "react-native-size-matters";
import { partialApplication } from "@potluckmarket/ella";
import { Modal } from "semantic-ui-react";
import { Product } from "product";

const SearchResults = (props: RNWebComponent) => {
  const searchQuery =
    Platform.OS === "web"
      ? props.location.state[0].searchQuery
      : props.navigation.getParam("searchQuery", null);

  const store: import("@potluckmarket/types").Store =
    Platform.OS === "web"
      ? props.location.state[0].store
      : props.navigation.getParam("store", {});

  const products: import("@potluckmarket/types").InventoryItem[] =
    Platform.OS === "web"
      ? props.location.state[0].products
      : props.navigation.getParam("products", null);

  const filteredProducts = products.length
    ? products.filter(product =>
        product.product.slug.includes(
          searchQuery.replace(/ /g, "_").toLowerCase()
        )
      )
    : [];

  const navigateToWebURL = partialApplication(
    stackHistory,
    props.history,
    `/dispensary/${slugify(store.name)}/menu`
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState<
    import("@potluckmarket/types").InventoryItem | null
  >(null);

  function openModal(item: import("@potluckmarket/types").InventoryItem) {
    setActiveMenuItem(item);
    setModalOpen(true);
  }

  return (
    <Fragment>
      <Topbar
        navigation={
          Platform.OS === "web"
            ? () => props.history.goBack()
            : () => props.navigation.goBack()
        }
        title={`Showing results for: ${searchQuery}`}
      />
      {filteredProducts.length ? (
        <ProductList
          openModal={openModal}
          products={filteredProducts}
          navigate={
            Platform.OS === "web" ? navigateToWebURL : props.navigation.navigate
          }
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

      <Modal
        open={modalOpen}
        closeIcon
        onClose={() => setModalOpen(false)}
        scrolling
      >
        {activeMenuItem && (
          <Modal.Content>
            <Product
              {...{
                history: props.history,
                location: props.location,
                match: props.match
              }}
              store={store}
              product={activeMenuItem}
            />
          </Modal.Content>
        )}
      </Modal>
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
