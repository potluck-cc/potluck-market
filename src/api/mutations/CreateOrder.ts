import gql from "graphql-tag";

export default gql`
  mutation CreateOrder(
    $store: String!
    $user: String!
    $total: Float!
    $date: String!
    $products: AWSJSON
    $time: String!
    $storeID: String
    $subtotal: Float
    $tax: Float
    $discount: Float
    $discountDisplayValue: String
    $subtotalDisplayValue: String
    $taxDisplayValue: String
    $totalDisplayValue: String
    $delivery: Boolean
    $pickup: Boolean
  ) {
    createOrder(
      input: {
        store: $store
        user: $user
        total: $total
        date: $date
        status: new
        products: $products
        time: $time
        storeID: $storeID
        subtotal: $subtotal
        tax: $tax
        discount: $discount
        discountDisplayValue: $discountDisplayValue
        subtotalDisplayValue: $subtotalDisplayValue
        taxDisplayValue: $taxDisplayValue
        totalDisplayValue: $totalDisplayValue
        delivery: $delivery
        pickup: $pickup
      }
    ) {
      id
      total
      subtotal
      tax
      discount
      date
      status
      time
      storeID
      discountDisplayValue
      subtotalDisplayValue
      taxDisplayValue
      totalDisplayValue
      delivery
      pickup
      user {
        id
        firstname
        lastname
        patientID
        phone
      }
      products {
        product {
          name
        }
        productType
        quantity
        price
        isCannabisProduct
        option {
          amount
          weight
        }
      }
    }
  }
`;
