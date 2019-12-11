import { CartActions } from "../actions/types";

import {
  calculateCartTotals,
  calculateTotalItemsInCart
} from "@potluckmarket/ella";

export type CART_STATE = {
  cart: import("@potluckmarket/types").OrderItem[];
  currentlyShoppingStore: import("@potluckmarket/types").Store | {};
  totalItemsInCart: number;
  subtotal: number;
  total: number;
  tax: number;
  taxDisplayValue: string;
  totalDisplayValue: string;
  subtotalDisplayValue: string;
};

const initialState: CART_STATE = {
  cart: [],
  currentlyShoppingStore: {},
  totalItemsInCart: 0,
  subtotal: 0,
  total: 0,
  tax: 0,
  taxDisplayValue: "",
  totalDisplayValue: "",
  subtotalDisplayValue: ""
};

function onCartUpdate(
  updatedCart,
  discount = "",
  discountTypeIsPercentage = false,
  taxVal = 0
) {
  const [
    subtotal,
    total,
    tax,
    taxDisplayValue,
    totalDisplayValue,
    subtotalDisplayValue
  ] = calculateCartTotals(
    updatedCart,
    discount,
    discountTypeIsPercentage,
    taxVal
  );

  return {
    subtotal,
    total,
    tax,
    taxDisplayValue,
    totalDisplayValue,
    subtotalDisplayValue
  };
}

export function findItemInCartById(
  cart: import("@potluckmarket/types").OrderItem[],
  id: string
): import("@potluckmarket/types").OrderItem[] {
  return cart.filter(({ item }) => item.id === id);
}

export default (state = initialState, action): CART_STATE => {
  switch (action.type) {
    case CartActions.ADD_PRODUCT_TO_CART:
      const cartWithAddedProduct = [...state.cart, action.payload];

      const { ...cartTotalsAfterAddingAProduct } = onCartUpdate(
        cartWithAddedProduct
      );

      return {
        ...state,
        ...cartTotalsAfterAddingAProduct,
        cart: cartWithAddedProduct,
        totalItemsInCart: calculateTotalItemsInCart(cartWithAddedProduct)
      };

    case CartActions.REMOVE_ITEM_FROM_CART: {
      const cartWithAProductRemoved = state.cart.filter(
        ({ item }) => item.id !== action.payload
      );

      const { ...cartTotalsAfterRemovingAProduct } = onCartUpdate(
        cartWithAProductRemoved
      );

      return {
        ...state,
        ...cartTotalsAfterRemovingAProduct,
        cart: cartWithAProductRemoved,
        totalItemsInCart: calculateTotalItemsInCart(cartWithAProductRemoved)
      };
    }

    case CartActions.REMOVE_ITEMS_FROM_CART_BY_WHITELIST_OF_IDS:
      const cartWithProductsRemoved = state.cart.filter(({ item }) =>
        action.payload.includes(item.id)
      );

      const { ...cartTotalsAfterRemovingAProduct } = onCartUpdate(
        cartWithProductsRemoved
      );

      return {
        ...state,
        ...cartTotalsAfterRemovingAProduct,
        cart: cartWithProductsRemoved,
        totalItemsInCart: calculateTotalItemsInCart(cartWithProductsRemoved)
      };

    case CartActions.SET_CURRENTLY_SHOPPING_STORE:
      return {
        ...state,
        currentlyShoppingStore: action.payload,
        cart: [],
        totalItemsInCart: calculateTotalItemsInCart([])
      };

    case CartActions.CHECKOUT:
      return {
        ...initialState,
        currentlyShoppingStore: state.currentlyShoppingStore
      };

    default:
      return state;
  }
};

export const total = cart => {
  if (cart.length) {
    return calculateTotalItemsInCart(cart);
  }
};
