import React, { useCallback, useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { GenericButton } from "common/components";
import { Icon } from "react-native-elements";
import { Text } from "@ui-kitten/components";
import { addItemToCart } from "actions";
import { useDispatch } from "react-redux";
import { CART_STATE, findItemInCartById } from "reducers/cart";
import { CannabisWeightValues } from "@potluckmarket/ella";
import { scale } from "react-native-size-matters";
import { isBrowser } from "react-device-detect";

type OrderPanelProps = {
  hide: Function;
  product: import("@potluckmarket/types").InventoryItem;
};

export default function({ hide = () => {}, product }: OrderPanelProps) {
  const [activeOptionIndex, selectOptionIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();
  const buttonDisabled =
    product.isCannabisProduct && product.quantity < 1
      ? true
      : !product.isCannabisProduct && product.quantity < 3.5
      ? true
      : !product.isCannabisProduct && !product.options
      ? true
      : false;

  const cart = useSelector<CART_STATE>(state =>
    findItemInCartById(state.cart.cart, product.id)
  );

  const addToCart = useCallback(
    ({
      product,
      activeOptionIndex,
      quantity
    }: {
      product: import("@potluckmarket/types").InventoryItem;
      activeOptionIndex: number;
      quantity: number;
    }) =>
      dispatch(
        addItemToCart({
          option: product.isCannabisProduct
            ? null
            : product.options[activeOptionIndex],
          item: product,
          quantity,
          requestedGrams: product.isCannabisProduct
            ? null
            : CannabisWeightValues[product.options[activeOptionIndex].weight] *
              quantity
        })
      ),
    [dispatch]
  );

  function renderOptions({ options = [], activeOptionIndex }) {
    return options.map((option, index) => {
      if (
        option.amount && product.isCannabisProduct
          ? quantity <= product.quantity
          : option.amount &&
            CannabisWeightValues[`${option.weight}`] <= product.quantity
      ) {
        const optionSelected = index === activeOptionIndex;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => selectOptionIndex(index)}
          >
            <View
              style={[
                styles.singleWeightOptionContainer,
                {
                  backgroundColor: optionSelected ? "#84D8B7" : "#E8E8E8"
                }
              ]}
            >
              <Text
                style={[
                  { color: optionSelected ? "white" : "black" },
                  styles.weightOptionText
                ]}
              >
                {`$${option.amount}`}
              </Text>
              <View
                style={[
                  styles.weightOptionTitleContainer,
                  {
                    backgroundColor: optionSelected ? "#62CCA1" : "#DCDCDC"
                  }
                ]}
              >
                <Text
                  style={[
                    { color: optionSelected ? "white" : "black" },
                    styles.weightOptionText
                  ]}
                >
                  {option.weight}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      }
    });
  }

  function handleQuantity(operationType) {
    if (operationType === "increase") {
      setQuantity(quantity => quantity + 1);
    } else {
      setQuantity(quantity => {
        if (quantity == 1) {
          return quantity;
        } else {
          return quantity - 1;
        }
      });
    }
  }

  return (
    <ScrollView style={[styles.container, { flex: 1 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => hide()}>
          <Icon
            color="black"
            size={30}
            name="close"
            type="material-community"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.productData}>
        {product && <Text category="h3">{product.product.name}</Text>}
        {product && <Text category="h6">{`(${product.productType})`}</Text>}
      </View>

      <View style={styles.quantityOptionsContainer}>
        <TouchableOpacity
          style={styles.quantityBtn}
          onPress={() => handleQuantity("decrease")}
        >
          <Icon name="minus" type="material-community" />
        </TouchableOpacity>

        <View style={styles.quantity}>
          <Text style={styles.quantityText}>QTY.</Text>
          <Text style={styles.quantityText}>{`${quantity}`}</Text>
        </View>

        <TouchableOpacity
          style={styles.quantityBtn}
          onPress={() => handleQuantity("increase")}
        >
          <Icon name="plus" type="material-community" />
        </TouchableOpacity>
      </View>

      {product.options && (
        <View style={styles.weightOptionsContainer}>
          {renderOptions({
            options: product.options,
            activeOptionIndex
          })}
        </View>
      )}

      <GenericButton
        style={[
          styles.btn,
          cart.length
            ? {
                backgroundColor: "red"
              }
            : {}
        ]}
        disabled={buttonDisabled}
        buttonText={buttonDisabled ? "Unavailable" : "Add to cart"}
        onPress={
          buttonDisabled
            ? () => {}
            : () => {
                addToCart({ product, activeOptionIndex, quantity });
                hide();
                selectOptionIndex(0);
                setQuantity(1);
              }
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    padding: 20
    // zIndex: 9999,
  },
  productData: {
    alignItems: "center"
  },
  header: {
    width: "100%",
    alignItems: "flex-end",
    justifyContent: "flex-end"
  },
  quantityOptionsContainer: {
    marginTop: 50,
    flexDirection: "row",
    justifyContent: "center"
  },
  quantityBtn: {
    backgroundColor: "#E8E8E8",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  quantity: {
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  quantityText: {
    fontSize: scale(14),
    marginTop: isBrowser && 10
  },
  weightOptionsContainer: {
    marginTop: 50,
    flexDirection: "row",
    justifyContent: "center"
  },
  weightOptionText: {
    fontSize: scale(14)
  },
  singleWeightOptionContainer: {
    borderRadius: 5,
    padding: scale(10),
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
    marginRight: 5
  },
  weightOptionTitleContainer: {
    padding: scale(5),
    borderRadius: 5,
    marginTop: isBrowser && 10
  },
  btn: {
    alignSelf: "center",
    marginTop: 30
  }
});
