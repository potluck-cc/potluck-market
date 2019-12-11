import gql from "graphql-tag";

export default gql`
  query GetDoctor($id: ID!) {
    getDoctor(id: $id) {
      id
      name
      marketToken
      marketWebToken
      stateId
      medCard
    }
  }
`;
