import React, { useState, useContext, useCallback, Fragment } from "react";
import AppContext from "appcontext";
import { useSelector } from "react-redux";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator
} from "react-native";
import {
  Colors,
  isLandscape,
  useDimensions,
  slugify,
  getLocationPermissions,
  getLocationAsync,
  getLocationRules,
  SupportedLocations
} from "common";
import {
  SlidingMenu,
  GenericButton,
  MessageModal,
  Modal
} from "common/components";
import { Radio } from "@ui-kitten/components";
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
import { isBrowser, isMobile, isIOS13 } from "react-device-detect";
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
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
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

  async function _checkout() {
    setIsCheckingOut(true);

    if (!currentAuthenticatedUser) {
      setIsCheckingOut(false);
      return setErrorMessage("You need to be logged in to checkout.");
    } else if (currentAuthenticatedUser && !currentAuthenticatedUser.stateId) {
      setIsCheckingOut(false);
      return setErrorMessage(
        `In order to process your transaction, we need a copy of your New Jersey State ID card to send over to ${currentlyShoppingStore.name ||
          "the dispensary"}. Please visit the "settings" section of the app, click "Verification" and follow the instructions listed.`
      );
    }

    if (!currentAuthenticatedUser) {
      setIsCheckingOut(false);
      return setErrorMessage("You need to be logged in to checkout.");
    }

    if (!currentlyShoppingStore.pickup) {
      setIsCheckingOut(false);
      return setErrorMessage(
        `${currentlyShoppingStore.name} is not accepting pickup orders at this time.`
      );
    }

    if (!cart.length) {
      setIsCheckingOut(false);
      return setErrorMessage(
        "You need to put some items in the cart in order to checkout!"
      );
    }

    if (determineIfOrderTimeIsValid()) {
      const availableItems = await validateCart();

      if (availableItems.length === cart.length) {
        await getLocationPermissions({
          onSuccess: async () => {
            await getLocationAsync({
              onSuccess: async locations => {
                const location =
                  SupportedLocations[slugify(locations[0].region)];

                if (location !== currentlyShoppingStore.state) {
                  setIsCheckingOut(false);
                  return setErrorMessage(
                    "You need to physically be in the area of the dispensary that you're placing an order with"
                  );
                }

                const rules = getLocationRules(location);

                if (
                  rules.medical &&
                  !currentAuthenticatedUser.medCard &&
                  !rules.rec
                ) {
                  setIsCheckingOut(false);

                  return setErrorMessage(
                    `In order to process your transaction, we need a copy of your Medical Marijuana Program patient ID card to send over to ${currentlyShoppingStore.name ||
                      "the dispensary"}. Please visit the "settings" section of the app, click "Verification" and follow the instructions listed.`
                  );
                } else {
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
                      setErrorMessage(
                        "Something went wrong! Please try again!"
                      );
                    }
                  });

                  if (order) {
                    checkoutCart();

                    setIsCheckingOut(false);

                    setErrorMessage(
                      `Your order has been sent over to ${currentlyShoppingStore.name}. Please check the status of your order in the "orders" page located in the "profile" section. Please remember to present your patient ID card when fulfilling your order.`
                    );
                  } else {
                    setIsCheckingOut(false);

                    setErrorMessage("Something went wrong! Please try again!");
                  }
                }
              },
              onFail: () => {
                alert(
                  "Something went wrong while locating you, please try again later."
                );
                setIsCheckingOut(false);
              }
            });
          },
          onFail: () => {
            alert(
              "We need access to your location in order to verify your order."
            );
            setIsCheckingOut(false);
          }
        });
      } else {
        await setUnavailableItems(availableItems);

        setIsCheckingOut(false);

        setErrorMessage(
          `One or more of the items you have selected are either no longer available or have insufficient quantity to satisfy your request.`
        );
      }
    } else {
      setIsCheckingOut(false);
      // setErrorMessage(
      //   "The date you've selected is invalid. Please select another date to place your order."
      // );
    }
  }

  return isMobile || isIOS13 ? (
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
            <Radio
              style={styles.radio}
              textStyle={{ color: "white" }}
              text="Pickup"
              checked={true}
            />
            <Radio
              style={styles.radio}
              textStyle={{ color: "white" }}
              text="Delivery"
              disabled={true}
            />
          </View>

          {isCheckingOut ? (
            <ActivityIndicator
              size="small"
              color={Colors.gray}
              style={{
                marginTop: 20
              }}
            />
          ) : (
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
          )}

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
        </View>
      )}
    </SlidingMenu>
  ) : (
    <Fragment>
      <CartHeader
        titleStyle={{
          fontSize: moderateScale(18),
          color: "black",
          margin: 10
        }}
        count={totalItemsInCart}
        onPress={() => setIsModalVisible(true)}
      />

      <Modal
        isVisible={isModalVisible}
        style={{
          backgroundColor: "white"
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            padding: 15
          }}
        >
          <TouchableOpacity onPress={() => setIsModalVisible(false)}>
            <Icon
              color="black"
              size={30}
              name="close"
              type="material-community"
            />
          </TouchableOpacity>
        </View>

        <View>
          <ProductList
            total={subtotalDisplayValue}
            containerStyle={{
              // opacity: expanded ? 1 : 0,
              paddingHorizontal: 25,
              paddingVertical: isLandscape(dimensions) ? 20 : 40
              // display: !expanded ? "none" : null
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
            textStyle={{
              color: "black"
            }}
          />
          <View
            style={[
              styles.optionsContainer,
              {
                // display: !expanded ? "none" : null
              }
            ]}
          >
            <Radio style={styles.radio} text="Pickup" checked={true} />
            <Radio style={styles.radio} text="Delivery" disabled={true} />
          </View>

          {isCheckingOut ? (
            <ActivityIndicator
              size="small"
              color={Colors.gray}
              style={{
                marginTop: 20
              }}
            />
          ) : (
            <GenericButton
              buttonText="Checkout"
              style={{
                alignSelf: "center",
                marginTop: 20
              }}
              onPress={() => _checkout()}
            />
          )}

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
        </View>
      </Modal>
    </Fragment>
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
    marginVertical: 4,
    color: "white"
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
