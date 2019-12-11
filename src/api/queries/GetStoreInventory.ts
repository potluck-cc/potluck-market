import gql from "graphql-tag";

export default gql`
  query GetStoreInventory(
    $storeId: ID!
    $metadata: String
    $nextToken: String
  ) {
    getStoreInventoryWithFilters(
      nextToken: $nextToken
      storeId: $storeId
      metadata: $metadata
    ) {
      items {
        id
        quantity
        productType
        thc
        cbd
        image
        description
        strainType
        displayName
        isCannabisProduct
        createdAt
        storeId
        options {
          amount
          weight
        }
        price
        product {
          id
          name
          slug
        }
      }
      nextToken
    }
  }
`;
