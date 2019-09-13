import gql from "graphql-tag";

export default gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      confirmed
      firstname
      lastname
      city
      street
      patientID
      expiration
      email
      phone
    }
  }
`;
