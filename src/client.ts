import AWSAppSyncClient from "aws-appsync";
import { Auth } from "aws-amplify";

const aws_appsync_region = "us-east-1";

const client_DEV_LOGGED_OUT = new AWSAppSyncClient({
  url:
    "https://tkwq4aqahzeahawpc7bvbasbqu.appsync-api.us-east-1.amazonaws.com/graphql",
  region: aws_appsync_region,
  auth: {
    type: "API_KEY",
    apiKey: "da2-3irym2gbjfa2dmglltblgdzuta"
  },
  offlineConfig: {
    keyPrefix: "dev_logged_out"
  }
});

const client_DEV_LOGGED_IN = new AWSAppSyncClient({
  url:
    "https://tkwq4aqahzeahawpc7bvbasbqu.appsync-api.us-east-1.amazonaws.com/graphql",
  region: aws_appsync_region,
  auth: {
    type: "AMAZON_COGNITO_USER_POOLS",
    jwtToken: async () =>
      (await Auth.currentSession()).getIdToken().getJwtToken()
  },
  offlineConfig: {
    keyPrefix: "dev_logged_in"
  }
});

const client_PROD_PRIVATE = new AWSAppSyncClient({
  url:
    "https://wlfhlloh3rflpey2dvzp67yuum.appsync-api.us-east-1.amazonaws.com/graphql",
  region: aws_appsync_region,
  auth: {
    type: "AMAZON_COGNITO_USER_POOLS",
    jwtToken: async () =>
      (await Auth.currentSession()).getIdToken().getJwtToken()
  },
  offlineConfig: {
    keyPrefix: "private"
  }
});

const client_PROD_PUBLIC = new AWSAppSyncClient({
  url:
    "https://wlfhlloh3rflpey2dvzp67yuum.appsync-api.us-east-1.amazonaws.com/graphql",
  region: aws_appsync_region,
  auth: {
    type: "API_KEY",
    apiKey: "da2-addppisl4jfn3ksgv2tzuvqpf4"
  },
  offlineConfig: {
    keyPrefix: "public"
  }
});

export function determineClient(currUser?) {
  if (currUser) {
    return client_PROD_PRIVATE;
  } else {
    return client_PROD_PUBLIC;
  }

  if (__DEV__) {
    if (currUser) {
      return client_DEV_LOGGED_IN;
    } else {
      return client_DEV_LOGGED_OUT;
    }
  } else {
    if (currUser) {
      return client_PROD_PRIVATE;
    } else {
      return client_PROD_PUBLIC;
    }
  }
}
