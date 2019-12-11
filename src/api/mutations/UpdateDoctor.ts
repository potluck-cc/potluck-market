import gql from "graphql-tag";

export default gql`
  mutation UpdateDoctor(
    $id: ID!
    $phone: String
    $stateId: String
    $medCard: String
    $marketWebToken: String
  ) {
    updateDoctor(
      input: {
        id: $id
        phone: $phone
        stateId: $stateId
        medCard: $medCard
        marketWebToken: $marketWebToken
      }
    ) {
      id
    }
  }
`;
