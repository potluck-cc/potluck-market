import gql from "graphql-tag";

export default gql`
  mutation UpdateInventoryItemStock($id: ID!, $quantity: Float) {
    updateStock(input: { id: $id, quantity: $quantity }) {
      id
      quantity
    }
  }
`;
