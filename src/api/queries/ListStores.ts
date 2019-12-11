import gql from "graphql-tag";

export default gql`
  query ListStores {
    # listStores(filter: { public: { eq: true } }) {
    listStores {
      items {
        companyId
        id
        name
        street
        zip
        city
        state
        phone
        latitude
        longitude
        pickup
        link
        logo
        storefrontImage
        maxDays
        slug
        hours {
          day
          endTime
          startTime
        }
      }
    }
  }
`;
