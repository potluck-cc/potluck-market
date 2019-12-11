import gql from "graphql-tag";

export default gql`
  query FindDispensaryByMetadata($metadata: String!) {
    getStoreByMetadata(metadata: $metadata) {
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
      link
      pickup
      slug
      logo
      storefrontImage
      maxDays
      hours {
        day
        endTime
        startTime
      }
    }
  }
`;
