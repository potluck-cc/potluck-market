import React from "react";
import { ScrollView, View, Platform } from "react-native";
import { Display, ButtonHeader } from "common/components";
import { Text } from "react-native-ui-kitten";
import { useDimensions, isIphoneXorAbove } from "common";

export default function ProductMobileView({
  product,
  goBack,
  renderLightbox,
  onImagePress,
  store,
  renderCannabinoidProfile,
  styles
}) {
  const { heightToDP } = useDimensions();
  return (
    <ScrollView>
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
        renderSvg={product && product.image ? true : false}
        renderContent={() => (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: Platform.select({
                ios: isIphoneXorAbove() ? null : heightToDP("5%"),
                android: heightToDP("5%")
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
          </View>
        )}
      />

      {product && product.image && renderLightbox()}
    </ScrollView>
  );
}
