import gql from "graphql-tag";

export default gql`
  subscription UpdateInventoryItemStockSubscription($id: ID) {
    onUpdateInventoryItemStock(id: $id) {
      id
      quantity
    }
  }
`;
