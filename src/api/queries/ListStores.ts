import gql from "graphql-tag";

export default gql`
  query ListStores($lat: Float!, $lng: Float!, $distance: String) {
    geosearchStores(lat: $lat, lng: $lng, distance: $distance) {
      id
      name
      city
      state
      street
      latitude
      longitude
      storefrontImage
      logo
      slug
    }
  }
`;

// export default gql`
//   query ListStores {
//     listStores(filter: { public: { eq: true } }) {
//   # listStores {
//       items {
//         companyId
//         id
//         name
//         street
//         zip
//         city
//         state
//         phone
//         latitude
//         longitude
//         pickup
//         link
//         logo
//         storefrontImage
//         maxDays
//         slug
//         hours {
//           day
//           endTime
//           startTime
//         }
//       }
//     }
//   }
// `;
