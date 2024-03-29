module.exports = function(api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            assets: "./assets",
            client: "./src/client.ts",
            dispensary: "./src/dispensary/index.ts",
            common: "./src/common",
            "common/components": "./src/common/components/index.ts",
            cart: "./src/cart/index.ts",
            orders: "./src/orders/index.ts",
            product: "./src/product/index.ts",
            queries: "./src/api/queries/index.ts",
            mutations: "./src/api/mutations/index.ts",
            subscriptions: "./src/api/subscriptions/index.ts",
            actions: "./src/actions/index.ts",
            reducers: "./src/reducers",
            auth: "./src/auth/index.ts",
            appcontext: "./AppContext.ts",
            profile: "./src/profile/index.ts",
            ads: "./src/ads/index.ts"
          }
        }
      ]
    ]
  };
};
