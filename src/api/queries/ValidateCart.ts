import gql from "graphql-tag";

export default gql`
  query ValidateCart($cart: AWSJSON!, $storeId: ID!) {
    validateCart(cart: $cart, storeId: $storeId) {
      id
    }
  }
`;
