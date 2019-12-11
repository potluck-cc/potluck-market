import React, { useState, useContext, useCallback } from "react";
import AppContext from "appcontext";
import { useSelector } from "react-redux";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Colors, isLandscape, useDimensions } from "common";
import { SlidingMenu, GenericButton, MessageModal } from "common/components";
import { Radio } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";
import CartHeader from "./CartHeader";
import ProductList from "./ProductList";
import moment from "moment";
import {
  dateFormat,
  appsyncFetch,
  OperationType,
  createTimestamp
} from "@potluckmarket/ella";
import { scale, moderateScale } from "react-native-size-matters";
import { isBrowser, isMobile } from "react-device-detect";
import { CART_STATE } from "reducers/cart";
import { checkout, removeItemsFromCartByWhitelistOfIds } from "actions";
import { useDispatch } from "react-redux";
import { CreateOrder } from "mutations";
import { ValidateCart } from "queries";
import { Auth } from "aws-amplify";
import AWSAppSyncClient from "aws-appsync";

function generateOrderCode(storeName: string): string {
  const letters = storeName.replace(/[a-z]/g, "");
  const lettersWithoutSpace = letters.replace(/ /g, "");
  const code = `${lettersWithoutSpace}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  return code;
}

export default function({ navigate }) {
  const { dimensions } = useDimensions();
  const [delivery, setDelivery] = useState(false);
  const [date, setDate] = useState(moment(new Date()).format(dateFormat));
  const [errorMessage, setErrorMessage] = useState("");
  const { currentAuthenticatedUser, client } = useContext(AppContext);
  const [unavailableItems, setUnavailableItems] = useState<string[]>([]);
  const {
    cart: {
      cart,
      totalItemsInCart,
      subtotalDisplayValue,
      currentlyShoppingStore,
      total,
      tax,
      subtotal,
      taxDisplayValue,
      totalDisplayValue
    }
  } = useSelector<CART_STATE>(state => state);
  const dispatch = useDispatch();

  const checkoutCart = useCallback(() => dispatch(checkout()), [dispatch]);

  const removeUnavailableItemsFromCart = useCallback(
    (itemsToRemove: string[]) =>
      dispatch(removeItemsFromCartByWhitelistOfIds(itemsToRemove)),
    [dispatch]
  );

  function determineIfOrderTimeIsValid() {
    const selectedDateAsAWeekday = moment(date).format("dddd");

    const selectedDateCorrespondingDispensaryHourBlock = currentlyShoppingStore.hours.filter(
      date => date.day === selectedDateAsAWeekday
    );

    if (
      selectedDateCorrespondingDispensaryHourBlock[0].endTime === "CLOSED" &&
      selectedDateCorrespondingDispensaryHourBlock[0].startTime === "CLOSED"
    ) {
      setErrorMessage(
        `${currentlyShoppingStore.name} is closed on ${selectedDateAsAWeekday}s.`
      );
      return false;
    }

    const closing = moment(
      `${date} ${selectedDateCorrespondingDispensaryHourBlock[0].endTime}`
    ).format();

    // const opening = moment(
    //   `${date} ${selectedDateCorrespondingDispensaryHourBlock[0].startTime}`
    // ).format();

    if (delivery) {
      if (moment(new Date()).isAfter(closing)) {
        setErrorMessage(
          `${currentlyShoppingStore.name} closes at ${selectedDateCorrespondingDispensaryHourBlock[0].endTime} on ${selectedDateAsAWeekday}s. Please adjust your delivery date.`
        );
        return false;
      } else {
        return true;
      }
    } else {
      if (
        moment(date).isSame(moment(new Date()).format(dateFormat)) &&
        moment(new Date()).isAfter(closing)
      ) {
        setErrorMessage(
          `${currentlyShoppingStore.name} closes at ${selectedDateCorrespondingDispensaryHourBlock[0].endTime} on ${selectedDateAsAWeekday}s.`
        );
        return false;
      } else if (
        moment(`${date}`).isBefore(moment(new Date()).format(dateFormat))
      ) {
        setErrorMessage(
          "You have to select a date that is either today or after today's date."
        );
        return false;
      } else {
        return true;
      }
    }
  }

  async function validateCart() {
    try {
      const { validateCart } = await appsyncFetch({
        client,
        document: ValidateCart,
        operationType: OperationType.query,
        fetchPolicy: "network-only",
        variables: {
          storeId: currentlyShoppingStore.id,
          cart: JSON.stringify(cart)
        }
      });

      return validateCart;
    } catch {
      setErrorMessage(
        "Something went wrong. Please try again in a few moments."
      );
      return null;
    }
  }

  // function updateStockValueOfItemsInCart() {
  //   let cartItemsWithAvailableQuantity = [];

  //   return cart.map(async cartItem => {
  //     const update = await appsyncFetch({
  //       client,
  //       operationType: OperationType.mutation,
  //       document: UpdateInventoryItemStock,
  //       variables: {
  //         storeId: cartItem.item.storeId,
  //         id: cartItem.item.id,
  //         quantity: cartItem.item.isCannabisProudct
  //           ? cartItem.quantity
  //           : cartItem.requestedGrams
  //       }
  //     });

  //     if (update && update.updateStock) {
  //       cartItemsWithAvailableQuantity.push(cartItem);
  //     }

  //     return cartItemsWithAvailableQuantity;
  //   });
  // }

  async function _checkout() {
    if (!currentAuthenticatedUser) {
      return setErrorMessage("You need to be logged in to checkout.");
    } else if (currentAuthenticatedUser && !currentAuthenticatedUser.stateId) {
      return setErrorMessage(
        `In order to process your transaction, we need a copy of your New Jersey State ID card to send over to ${currentlyShoppingStore.name ||
          "the dispensary"}. Please visit the "settings" section of the app, click "Verification" and follow the instructions listed.`
      );
    } else if (currentAuthenticatedUser && !currentAuthenticatedUser.medCard) {
      return setErrorMessage(
        `In order to process your transaction, we need a copy of your New Jersey Medical Marijuana Program patient ID card to send over to ${currentlyShoppingStore.name ||
          "the dispensary"}. Please visit the "settings" section of the app, click "Verification" and follow the instructions listed.`
      );
    }

    if (!currentlyShoppingStore.pickup) {
      return setErrorMessage(
        `${currentlyShoppingStore.name} is not accepting pickup orders at this time.`
      );
    }

    if (!cart.length) {
      return setErrorMessage(
        "You need to put some items in the cart in order to checkout!"
      );
    }

    if (determineIfOrderTimeIsValid()) {
      const availableItems = await validateCart();

      if (availableItems.length === cart.length) {
        const enterpriseClient = new AWSAppSyncClient({
          url:
            "https://l2hfi6ftpvej3ltins3muyefdm.appsync-api.us-east-1.amazonaws.com/graphql",
          region: "us-east-1",
          disableOffline: true,
          auth: {
            type: "AMAZON_COGNITO_USER_POOLS",
            jwtToken: async () =>
              (await Auth.currentSession()).getIdToken().getJwtToken()
          },
          offlineConfig: {
            keyPrefix: "enterprise"
          }
        });

        const order = await appsyncFetch({
          client: enterpriseClient,
          operationType: OperationType.mutation,
          document: CreateOrder,
          variables: {
            store: JSON.stringify(currentlyShoppingStore),
            customer: JSON.stringify(currentAuthenticatedUser),
            companyId: currentlyShoppingStore.companyId,
            customerId: currentAuthenticatedUser.id,
            storeId: currentlyShoppingStore.id,
            total,
            tax,
            subtotal,
            expectedCompletionDate: moment(date).unix(),
            createdAt: createTimestamp(),
            products: JSON.stringify(cart),
            discount: 0,
            taxDisplayValue,
            totalDisplayValue,
            subtotalDisplayValue,
            delivery: false,
            pickup: true,
            code: generateOrderCode(currentlyShoppingStore.name)
          },
          handleError: e => {
            console.log(e);
            setErrorMessage("Something went wrong! Please try again!");
          }
        });

        if (order) {
          checkoutCart();

          setErrorMessage(
            `Your order has been sent over to ${currentlyShoppingStore.name}. Please check the status of your order in the "orders" page located in the "profile" section. Please remember to present your patient ID card when fulfilling your order.`
          );
        } else {
          setErrorMessage("Something went wrong! Please try again!");
        }
      } else {
        await setUnavailableItems(availableItems);

        setErrorMessage(
          `One or more of the items you have selected are either no longer available or have insufficient quantity to satisfy your request.`
        );
      }
    } else {
      // setErrorMessage(
      //   "The date you've selected is invalid. Please select another date to place your order."
      // );
    }
  }

  return (
    <SlidingMenu
      style={{
        backgroundColor: Colors.medGreen
      }}
    >
      {({ expanded, setExpanded }) => (
        <View>
          <CartHeader
            titleStyle={{
              fontSize: expanded ? 24 : moderateScale(18)
            }}
            count={totalItemsInCart}
            onPress={expanded ? () => {} : () => setExpanded(!expanded)}
            disabled={expanded}
            renderCustomRight={
              expanded
                ? () => {
                    return (
                      <TouchableOpacity
                        style={{
                          height: 50,
                          width: 50,
                          borderRadius: 100,
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#1C1E1D"
                        }}
                        onPress={() => {
                          setExpanded(false);
                        }}
                      >
                        <Icon
                          name="close"
                          type="material-community"
                          color="white"
                        />
                      </TouchableOpacity>
                    );
                  }
                : null
            }
          />
          <ProductList
            total={subtotalDisplayValue}
            containerStyle={{
              opacity: expanded ? 1 : 0,
              paddingHorizontal: 25,
              paddingVertical: isLandscape(dimensions) ? 20 : 40,
              display: !expanded ? "none" : null
            }}
            items={cart}
            listStyle={{
              height:
                isMobile && isLandscape(dimensions) ? scale(50) : scale(150),
              paddingHorizontal: Platform.select({
                web: isBrowser && 200
              })
            }}
            totalContainerStyle={{
              width: Platform.select({
                web: isBrowser && "50%"
              }),
              alignSelf: Platform.select({
                default: null,
                web: (isBrowser && "center") || null
              })
            }}
          />
          <View
            style={[
              styles.optionsContainer,
              {
                display: !expanded ? "none" : null
              }
            ]}
          >
            <Radio style={styles.radio} text="Pickup" checked={true} />
            <Radio style={styles.radio} text="Delivery" disabled={true} />
          </View>

          <GenericButton
            buttonText="Checkout"
            style={{
              backgroundColor: "white",
              alignSelf: "center",
              marginTop: 20,
              display: !expanded ? "none" : null
            }}
            textStyle={{ color: "black" }}
            onPress={() => _checkout()}
          />

          <MessageModal
            message={errorMessage}
            isVisible={Boolean(errorMessage.length)}
            hide={() => setErrorMessage("")}
            btnText={
              errorMessage.includes("settings")
                ? "Verify"
                : errorMessage.includes("available")
                ? "Remove unavailable items"
                : undefined
            }
            onPress={
              errorMessage.includes("settings")
                ? () => navigate("/verification")
                : errorMessage.includes("available")
                ? async () => {
                    await removeUnavailableItemsFromCart(unavailableItems);
                    setErrorMessage("");
                  }
                : null
            }
          />

          {/* {errorMessage && (
            <Text
              style={{
                color: "red",
                alignSelf: "center",
                display: !expanded ? "none" : null,
                textAlign: "center",
                paddingHorizontal: 20
              }}
            >
              {errorMessage}
            </Text>
          )} */}
        </View>
      )}
    </SlidingMenu>
  );
}

const styles = StyleSheet.create({
  text: {
    color: "white"
  },
  optionsContainer: {
    flexDirection: "row",
    alignSelf: "center"
  },
  radio: {
    marginVertical: 4
  },
  datePickerBtn: {
    height: 50,
    width: "65%",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    alignSelf: "center"
  }
});
