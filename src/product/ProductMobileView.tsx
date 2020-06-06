import React, { useState, useCallback } from "react";
import { ScrollView, View, Platform, StyleSheetProperties } from "react-native";
import { OrderPanel } from "cart";
import { Display, ButtonHeader, GenericButton } from "common/components";
import { Text } from "@ui-kitten/components";
import { useDimensions, isIphoneXorAbove } from "common";
import ProductActions from "./ProductActions";
import Modal from "modal-enhanced-react-native-web";
import { removeItemFromCart } from "actions";
import { CART_STATE, findItemInCartById } from "reducers/cart";
import { useSelector, useDispatch } from "react-redux";
import { Linking } from "expo";

type ProductMobileViewProps = {
  product: import("@potluckmarket/types").InventoryItem;
  goBack: Function;
  renderLightbox: () => JSX.Element;
  onImagePress: Function;
  store: import("@potluckmarket/types").Store;
  renderCannabinoidProfile: () => JSX.Element;
  styles: StyleSheetProperties;
};

export default function ProductMobileView({
  product,
  goBack,
  renderLightbox,
  onImagePress,
  store,
  renderCannabinoidProfile,
  styles
}: ProductMobileViewProps) {
  const { heightToDP, isLandscape } = useDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();

  const listOfItemsInCartMatchingCurrentProductId = useSelector<CART_STATE>(
    state => findItemInCartById(state.cart.cart, product.id)
  );

  const removeFromCart = useCallback(
    () => dispatch(removeItemFromCart(product.id)),
    [dispatch]
  );

  function generateURLForWebRedirect({
    state,
    city,
    slug,
    product
  }: {
    state: string;
    city: string;
    slug: string;
    product: string;
  }) {
    if (__DEV__) {
      return `http://10.0.0.117:19006/dispensary/usa-${state}-${city}/${slug}/menu/${product}`;
    } else {
      return `https://app.potluckmarket.com/dispensary/usa-${state}-${city}/${slug}/menu/${product}`;
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView
        contentContainerStyle={{
          marginBottom: heightToDP("20%")
        }}
        style={
          {
            // paddingBottom: heightToDP("20%")
          }
        }
      >
        <Display
          imageSource={
            product && product.image
              ? product.image
              : store && store.logo
              ? store.logo
              : null
          }
          aspectRatio={
            product && product.image
              ? null
              : store && store.logo
              ? "xMinYMid meet"
              : null
          }
          onImagePress={() => onImagePress()}
          imagePressDisabled={!product || !product.image}
          renderHeader={() => <ButtonHeader onBackBtnPress={() => goBack()} />}
          renderSvg={!product.image && store.logo ? false : true}
          renderContent={() => (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: Platform.select({
                  ios: isIphoneXorAbove() ? null : heightToDP("5%"),
                  android: heightToDP("5%"),
                  web: isLandscape && heightToDP("3%")
                }),
                paddingHorizontal: 20
              }}
            >
              <Text category="h6" style={styles.productName}>
                {product.product.name}
              </Text>

              <Text category="c1" style={styles.productStrainType}>
                {product.strainType === "CBD" ? "High CBD" : product.strainType}
              </Text>

              {product.description && (
                <Text style={styles.description}>{product.description}</Text>
              )}

              {renderCannabinoidProfile()}

              {product && product.image && renderLightbox()}
            </View>
          )}
        />
      </ScrollView>

      <ProductActions>
        {() => (
          <GenericButton
            onPress={
              Platform.OS === "web"
                ? listOfItemsInCartMatchingCurrentProductId.length
                  ? () => removeFromCart()
                  : () => setModalVisible(true)
                : () =>
                    Linking.openURL(
                      generateURLForWebRedirect({
                        state: store.state.toLowerCase(),
                        slug: store.slug,
                        city: store.city.toLowerCase(),
                        product: encodeURIComponent(
                          JSON.stringify(product).trim()
                        )
                      })
                    )
            }
            buttonText={
              listOfItemsInCartMatchingCurrentProductId.length
                ? "Remove from cart"
                : Platform.OS === "web"
                ? "Add to cart"
                : "Learn More"
            }
            style={{
              backgroundColor: listOfItemsInCartMatchingCurrentProductId.length
                ? "red"
                : "green",
              borderColor: listOfItemsInCartMatchingCurrentProductId.length
                ? "red"
                : "green"
            }}
          />
        )}
      </ProductActions>

      {Platform.OS === "web" && (
        <Modal
          isVisible={modalVisible}
          onBackdropPress={() => setModalVisible(false)}
          onBackButtonPress={() => setModalVisible(false)}
          coverScreen
          style={{
            padding: 0,
            margin: 0
          }}
        >
          <OrderPanel hide={() => setModalVisible(false)} product={product} />
        </Modal>
      )}
    </View>
  );
}
