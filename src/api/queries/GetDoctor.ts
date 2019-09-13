import gql from "graphql-tag";

export default gql`
  query GetDoctor($id: ID!) {
    getDoctor(id: $id) {
      id
      address
      county
      latitude
      longitude
      name
      newPatients
      phone
      specialty
      receiveChats
      pricePerVisit
      bio
      image
      token
    }
  }
`;
