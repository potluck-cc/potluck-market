import gql from "graphql-tag";

export default gql`
  mutation UpdateDoctor(
    $id: ID!
    $receiveChats: Boolean
    $pricePerVisit: String
    $bio: String
    $image: AWSURL
    $phone: String
    $token: String
  ) {
    updateDoctor(
      input: {
        id: $id
        receiveChats: $receiveChats
        pricePerVisit: $pricePerVisit
        bio: $bio
        image: $image
        phone: $phone
        token: $token
      }
    ) {
      id
    }
  }
`;
