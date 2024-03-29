import React, { useState } from "react";
import Amplify, { Auth } from "aws-amplify";
import awsConfig from "./aws-exports";
import { mapping, light as lightTheme } from "@eva-design/eva";
import { ApplicationProvider } from "@ui-kitten/components";
import Navigator from "./src/navigation/Navigator";
import AppContext from "appcontext";
import * as Permissions from "expo-permissions";
import { AppLoading, Notifications } from "expo";
import { Asset } from "expo-asset";
import { appsyncFetch, OperationType } from "@potluckmarket/ella";
import { GetUser, GetDoctor } from "queries";
import { UpdateUser, CreateUser, UpdateDoctor } from "mutations";
import { isUserADoctor } from "common";
import { determineClient } from "client";
import { Platform } from "react-native";
import { Provider } from "react-redux";
import { createStore } from "redux";
import reducers from "reducers";

Amplify.configure(awsConfig);

export default function App() {
  const [currentAuthenticatedUser, setCurrentAuthenticatedUser] = useState<
    import("@potluckmarket/types").User | null
  >(null);

  const [appReady, setAppReady] = useState(false);
  const [client, setClient] = useState(null);

  async function loadResources() {
    return Promise.all([
      Asset.loadAsync([
        require("./assets/images/Edible.png"),
        require("./assets/images/Flower.png"),
        require("./assets/images/Concentrate.png"),
        require("./assets/images/Topical.png"),
        require("./assets/images/potluckmed_android.png"),
        require("./assets/images/joints.png"),
        require("./assets/images/potluck_logo.png")
      ])
    ]);
  }

  async function initialize(currentUser?) {
    let currUser;
    let expoPushToken;

    try {
      if (currentUser) {
        currUser = currentUser;
      } else {
        currUser = await Auth.currentAuthenticatedUser();
      }

      expoPushToken = await registerForPushNotificationsAsync();
    } catch {}

    const client = await determineClient(currUser);
    await setClient(client);

    try {
      if (currUser) {
        const { getUser } =
          (await appsyncFetch({
            client,
            document: GetUser,
            operationType: OperationType.query,
            variables: {
              id: currUser.attributes.sub
            },
            fetchPolicy: "network-only"
          })) || null;

        if (getUser) {
          if (Platform.OS === "web") {
            if (
              (!getUser.marketWebToken && expoPushToken) ||
              (getUser.marketWebToken !== expoPushToken && expoPushToken)
            ) {
              await appsyncFetch({
                client,
                document: UpdateUser,
                operationType: OperationType.mutation,
                variables: {
                  id: getUser.id,
                  marketWebToken: expoPushToken
                }
              });

              await setCurrentAuthenticatedUser({
                ...getUser
              });
            } else {
              await setCurrentAuthenticatedUser(getUser);
            }
          } else {
            if (
              (!getUser.marketToken && expoPushToken) ||
              (getUser.marketToken !== expoPushToken && expoPushToken)
            ) {
              await appsyncFetch({
                client,
                document: UpdateUser,
                operationType: OperationType.mutation,
                variables: {
                  id: getUser.id,
                  marketToken: expoPushToken
                }
              });

              await setCurrentAuthenticatedUser({
                ...getUser
              });
            } else {
              await setCurrentAuthenticatedUser(getUser);
            }
          }
        } else {
          const { createUser } =
            (await appsyncFetch({
              client,
              document: CreateUser,
              operationType: OperationType.mutation,
              variables: {
                id: currUser.attributes.sub,
                phone: currUser.attributes.phone_number,
                marketToken: expoPushToken,
                firstname: currUser.attributes["custom:firstname"],
                lastname: currUser.attributes["custom:lastname"],
                email: currUser.attributes["custom:email"]
              }
            })) || null;

          if (createUser) {
            await setCurrentAuthenticatedUser({
              ...createUser
            });
          } else {
            await setCurrentAuthenticatedUser({
              id: currUser.attributes.sub,
              phone: currUser.attributes.phone_number,
              firstname: currUser.attributes["custom:firstname"],
              lastname: currUser.attributes["custom:lastname"],
              email: currUser.attributes["custom:email"],
              __typename: "User"
            });
          }
        }
      }
    } catch {
      if (currUser) {
        setCurrentAuthenticatedUser({
          id: currUser.attributes.sub,
          phone: currUser.attributes.phone_number,
          firstname: currUser.attributes["custom:firstname"],
          lastname: currUser.attributes["custom:lastname"],
          email: currUser.attributes["custom:email"]
        });
      }
    }
  }

  async function registerForPushNotificationsAsync() {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      return;
    }
    let token = await Notifications.getExpoPushTokenAsync();
    return token;
  }

  if (!appReady) {
    return (
      <AppLoading
        startAsync={async () => {
          await initialize();
          await loadResources();
        }}
        onFinish={() => setAppReady(true)}
      />
    );
  }

  return (
    <Provider store={createStore(reducers, {})}>
      <ApplicationProvider mapping={mapping} theme={lightTheme}>
        <AppContext.Provider
          value={{
            currentAuthenticatedUser,
            setCurrentAuthenticatedUser,
            initializeApp: initialize,
            client
          }}
        >
          <Navigator />
        </AppContext.Provider>
      </ApplicationProvider>
    </Provider>
  );
}
