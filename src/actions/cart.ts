import { CartActions } from "./types";

export const addItemToCart = (
  product: import("@potluckmarket/types").OrderItem
) => ({
  type: CartActions.ADD_PRODUCT_TO_CART,
  payload: product
});

export const removeItemFromCart = (productId: string) => ({
  type: CartActions.REMOVE_ITEM_FROM_CART,
  payload: productId
});

export const removeItemsFromCartByWhitelistOfIds = (productIds: string[]) => ({
  type: CartActions.REMOVE_ITEMS_FROM_CART_BY_WHITELIST_OF_IDS,
  payload: productIds
});

export const setCurrentlyShoppingStore = (
  store: import("@potluckmarket/types").Store
) => ({
  type: CartActions.SET_CURRENTLY_SHOPPING_STORE,
  payload: store
});

export const checkout = () => ({ type: CartActions.CHECKOUT });
