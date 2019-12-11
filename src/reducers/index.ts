import { combineReducers } from "redux";
import cart, * as fromCart from "./cart";

export default combineReducers({
  cart
});

export const total = state => fromCart.total(state.cart.cart);
