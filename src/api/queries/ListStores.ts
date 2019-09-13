import gql from "graphql-tag";

export default gql`
  query ListStores {
    listStores {
      items {
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
        logo
        storefrontImage
        maxDays
        hours {
          day
          endTime
          startTime
        }
        inventory {
          items {
            id
            productType
            quantity
            image
            price
            isCannabisProduct
            description
            thc
            cbd
            strainType
            options {
              amount
              weight
            }
            product {
              id
              name
              searchField
            }
          }
        }
      }
    }
  }
`;
