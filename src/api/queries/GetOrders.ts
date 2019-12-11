import gql from "graphql-tag";

export default gql`
  query GetOrdersByCustomer($customerId: ID!) {
    getOrdersByCustomer(customerId: $customerId) {
      items {
        id
        status
        totalDisplayValue
        code
        store {
          name
          logo
        }
        products {
          option {
            weight
            amount
          }
          quantity
          item {
            storeId
            createdAt
            id
            productType
            image
            price
            isCannabisProduct
            description
            thc
            cbd
            strainType
            quantity
            product {
              id
              name
              slug
            }
            options {
              amount
              weight
            }
          }
        }
      }
    }
  }
`;
