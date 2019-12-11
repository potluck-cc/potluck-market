import gql from "graphql-tag";

export default gql`
  mutation CreateOrder(
    $store: AWSJSON!
    $customer: AWSJSON!
    $total: Float!
    $expectedCompletionDate: AWSTimestamp!
    $createdAt: AWSTimestamp!
    $products: AWSJSON!
    $storeId: ID!
    $customerId: ID!
    $discount: Float
    $subtotal: Float!
    $code: String!
    $tax: Float
    $discountDisplayValue: String
    $subtotalDisplayValue: String
    $taxDisplayValue: String
    $totalDisplayValue: String
    $delivery: Boolean
    $pickup: Boolean!
    $companyId: ID!
  ) {
    createOrder(
      input: {
        store: $store
        customer: $customer
        customerId: $customerId
        total: $total
        code: $code
        createdAt: $createdAt
        status: new
        products: $products
        companyId: $companyId
        storeId: $storeId
        subtotal: $subtotal
        tax: $tax
        discount: $discount
        discountDisplayValue: $discountDisplayValue
        subtotalDisplayValue: $subtotalDisplayValue
        taxDisplayValue: $taxDisplayValue
        totalDisplayValue: $totalDisplayValue
        delivery: $delivery
        pickup: $pickup
        expectedCompletionDate: $expectedCompletionDate
      }
    ) {
      id
      storeId
      createdAt
      expectedCompletionDate
      total
      code
      totalDisplayValue
      status
      pos
      subtotal
      subtotalDisplayValue
      tax
      taxDisplayValue
      discount
      discountDisplayValue
      customer {
        id
        firstname
        lastname
        phone
        street
        city
        state
        stateId
        medCard
        marketToken
        marketWebToken
      }
      products {
        item {
          id
          quantity
          productType
          isCannabisProduct
          price
          product {
            id
            name
          }
        }
        quantity
        requestedGrams
        option {
          amount
          weight
        }
      }
    }
  }
`;
