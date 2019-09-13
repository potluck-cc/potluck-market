import gql from "graphql-tag";

export default gql`
  subscription UpdateDriverSubscription($id: ID) {
    onUpdateDriverLocation(id: $id) {
      currentLocation {
        latitude
        longitude
      }
    }
  }
`;
