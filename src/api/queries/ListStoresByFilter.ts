import gql from "graphql-tag";

export function generateStoreFilterQuery(filters: {
  delivery?: boolean;
  pickup?: boolean;
}) {
  if (filters.delivery && !filters.pickup) {
    return gql`
      query ListStores(
        $lat: Float!
        $lng: Float!
        $distance: String
        $delivery: Boolean
      ) {
        geosearchStores(
          lat: $lat
          lng: $lng
          distance: $distance
          filter: { delivery: $delivery }
        ) {
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
  } else if (filters.pickup && !filters.delivery) {
    return gql`
      query ListStores(
        $lat: Float!
        $lng: Float!
        $distance: String
        $pickup: Boolean
      ) {
        geosearchStores(
          lat: $lat
          lng: $lng
          distance: $distance
          filter: { pickup: $pickup }
        ) {
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
  } else {
    return gql`
      query ListStores(
        $lat: Float!
        $lng: Float!
        $distance: String
        $pickup: Boolean
        $delivery: Boolean
      ) {
        geosearchStores(
          lat: $lat
          lng: $lng
          distance: $distance
          filter: { delivery: $delivery, pickup: $pickup }
        ) {
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
  }
}

export default gql`
  query ListStores(
    $lat: Float!
    $lng: Float!
    $distance: String
    $pickup: Boolean
    $delivery: Boolean
  ) {
    geosearchStores(
      lat: $lat
      lng: $lng
      distance: $distance
      filter: { delivery: $delivery, pickup: $pickup }
    ) {
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
