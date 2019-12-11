import gql from "graphql-tag";

export default gql`
  mutation CreateUser(
    $id: ID!
    $confirmed: Boolean
    $firstname: String
    $lastname: String
    $patientID: String
    $expiration: String
    $email: AWSEmail
    $phone: AWSPhone
    $issued: String
    $dob: String
    $state: State
    $street: String
    $city: String
    $marketToken: String
    $stateId: String
    $medCard: String
    $marketWebToken: String
  ) {
    createUser(
      input: {
        id: $id
        confirmed: $confirmed
        firstname: $firstname
        lastname: $lastname
        patientID: $patientID
        expiration: $expiration
        email: $email
        phone: $phone
        issued: $issued
        dob: $dob
        state: $state
        street: $street
        city: $city
        marketToken: $marketToken
        stateId: $stateId
        medCard: $medCard
        marketWebToken: $marketWebToken
      }
    ) {
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
      marketToken
      marketWebToken
    }
  }
`;
