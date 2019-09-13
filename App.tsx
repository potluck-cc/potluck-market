import React, { useState } from "react";
import Amplify, { Auth } from "aws-amplify";
import awsConfig from "./aws-exports";
import { mapping, light as lightTheme } from "@eva-design/eva";
import { ApplicationProvider } from "react-native-ui-kitten";
import Navigation from "navigation";
import AppContext from "appcontext";
import * as Permissions from "expo-permissions";
import { AppLoading, Notifications } from "expo";
import { Asset } from "expo-asset";

import { appsyncFetch, OperationType } from "@potluckmarket/ella";
import client from "client";
import { GetUser, GetDoctor } from "queries";
import { UpdateUser, CreateUser, UpdateDoctor } from "mutations";
import { isUserADoctor } from "common";

Amplify.configure(awsConfig);

export default function App() {
  const [currentAuthenticatedUser, setCurrentAuthenticatedUser] = useState<
    | import("@potluckmarket/louis").User
    | import("@potluckmarket/louis").Doctor
    | null
  >(null);

  const [appReady, setAppReady] = useState(false);

  async function loadResources() {
    return Promise.all([
      Asset.loadAsync([
        require("./assets/images/Edible.png"),
        require("./assets/images/Flower.png"),
        require("./assets/images/Concentrate.png"),
        require("./assets/images/Topical.png"),
        require("./assets/images/potluckmed_android.png")
      ])
    ]);
  }

  async function initialize(currentUser?) {
    let currUser;
    let expoPushToken;
    let isADoctor;

    try {
      if (currentUser) {
        currUser = currentUser;
      } else {
        currUser = await Auth.currentAuthenticatedUser();
      }

      expoPushToken = await registerForPushNotificationsAsync();
      isADoctor = isUserADoctor(currUser);
    } catch {}

    try {
      if (currUser) {
        if (isADoctor) {
          const { getDoctor } =
            (await appsyncFetch({
              client,
              document: GetDoctor,
              operationType: OperationType.query,
              variables: {
                id: currUser.attributes.sub
              },
              fetchPolicy: "network-only"
            })) || null;

          if (getDoctor) {
            if (!getDoctor.token || getDoctor.token !== expoPushToken) {
              if (expoPushToken) {
                // await appsyncFetch({
                //   client,
                //   document: UpdateDoctor,
                //   operationType: OperationType.mutation,
                //   variables: {
                //     id: getDoctor.id,
                //     token: expoPushToken
                //   }
                // });

                await setCurrentAuthenticatedUser({
                  ...getDoctor,
                  token: expoPushToken
                });
              }
            } else {
              await setCurrentAuthenticatedUser(getDoctor);
            }
          } else {
            setCurrentAuthenticatedUser({
              id: currUser.attributes.sub,
              phone: currUser.attributes.phone_number,
              name: `${currUser.attributes["custom:firstname"]} ${currUser.attributes["custom:lastname"]}`,
              address: null,
              county: null,
              hours: null,
              latitude: null,
              longitude: null,
              newPatients: null,
              specialty: null,
              __typename: "Doctor"
            });
          }
        } else {
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
            if (!getUser.token || getUser.token !== expoPushToken) {
              // await appsyncFetch({
              //   client,
              //   document: UpdateUser,
              //   operationType: OperationType.mutation,
              //   variables: {
              //     id: getUser.id,
              //     token: expoPushToken
              //   }
              // });

              await setCurrentAuthenticatedUser({
                ...getUser,
                token: expoPushToken
              });
            } else {
              await setCurrentAuthenticatedUser(getUser);
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
                  token: expoPushToken,
                  firstname: currUser.attributes["custom:firstname"],
                  lastname: currUser.attributes["custom:lastname"],
                  email: currUser.attributes["custom:email"]
                }
              })) || null;

            if (createUser) {
              await setCurrentAuthenticatedUser({
                ...createUser,
                token: expoPushToken
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
      }
    } catch {
      if (currUser) {
        if (isADoctor) {
          setCurrentAuthenticatedUser({
            id: currUser.attributes.sub,
            phone: currUser.attributes.phone_number,
            name: `${currUser.attributes["custom:firstname"]} ${currUser.attributes["custom:lastname"]}`,
            address: null,
            county: null,
            hours: null,
            latitude: null,
            longitude: null,
            newPatients: null,
            specialty: null,
            __typename: "Doctor"
          });
        } else {
          setCurrentAuthenticatedUser({
            id: currUser.attributes.sub,
            phone: currUser.attributes.phone_number,
            token: expoPushToken,
            firstname: currUser.attributes["custom:firstname"],
            lastname: currUser.attributes["custom:lastname"],
            email: currUser.attributes["custom:email"],
            __typename: isADoctor ? "Doctor" : "User"
          });
        }
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
    <ApplicationProvider mapping={mapping} theme={lightTheme}>
      <AppContext.Provider
        value={{
          currentAuthenticatedUser,
          setCurrentAuthenticatedUser,
          initializeApp: initialize
        }}
      >
        <Navigation />
      </AppContext.Provider>
    </ApplicationProvider>
  );
}
