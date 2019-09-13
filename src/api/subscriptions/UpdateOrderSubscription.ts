import gql from "graphql-tag";

export default gql`
  subscription UpdateOrderSubscription($id: ID) {
    onUpdateOrder(id: $id) {
      deliveryStatus
    }
  }
`;
