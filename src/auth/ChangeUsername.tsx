import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import Confirm from "./Confirm";

import styles from "./defaultStyles";
import { Input, Button, Text } from "@ui-kitten/components";
import { Icon } from "react-native-elements";

import { useAuth } from "@potluckmarket/ella";
import { Auth } from "aws-amplify";
import { Colors, RNWebComponent } from "common";
import { ButtonHeader } from "common/components";
import { isBrowser } from "react-device-detect";

function ChangeUsername(props: RNWebComponent) {
  const {
    handleChangeAttribute,
    loading,
    username,
    error,
    handleStateChange,
    normalizePhoneStringInput,
    americanizePhoneNumber
  } = useAuth(Auth);

  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {
    const { retrieveData } = await import("@potluckmarket/ella");

    const changeUsernameRequested = await retrieveData(
      "changeUsernameRequested"
    );

    if (changeUsernameRequested) {
      if (Platform.OS === "web") {
        setConfirm(true);
      } else {
        props.navigation.navigate("Confirm", {
          verifyAttribute: true
        });
      }
    }
  }

  async function requestChangePhoneNumber(): Promise<void> {
    const { storeData } = await import("@potluckmarket/ella");
    const user = await Auth.currentAuthenticatedUser();

    handleChangeAttribute(
      {
        attributes: {
          phone_number: americanizePhoneNumber(
            normalizePhoneStringInput(username)
          )
        },
        user
      },
      async () => {
        await storeData(
          "changeUsernameRequested",
          `${americanizePhoneNumber(normalizePhoneStringInput(username))}`
        );

        if (Platform.OS === "web") {
          setConfirm(true);
        } else {
          props.navigation.navigate("Confirm", {
            verifyAttribute: true
          });
        }
      },
      error =>
        handleStateChange(
          "error",
          typeof error === "string" ? error : error.message
        )
    );
  }

  if (confirm) {
    return (
      <Confirm
        navigation={props.navigation}
        {...{
          history: props.history,
          location: props.location,
          match: props.match
        }}
        setConfirm={setConfirm}
        verifyAttribute
      />
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS !== "web" && (
        <ButtonHeader
          onBackBtnPress={() => props.navigation.goBack(null)}
          containerStyle={{ alignSelf: "flex-start" }}
        />
      )}
      <Input
        size="large"
        label="New Phone Number"
        onChangeText={text => handleStateChange("username", text)}
        style={styles.input}
        value={username}
        keyboardType={
          Platform.OS === "web" && isBrowser
            ? "numeric"
            : Platform.OS !== "web"
            ? "numeric"
            : null
        }
        returnKeyType="done"
        icon={({ tintColor }) => {
          return (
            <Icon
              name="cellphone"
              type="material-community"
              color={error ? "red" : tintColor}
              size={30}
            />
          );
        }}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="small" color={Colors.green} />
      ) : (
        <Button
          onPress={() => requestChangePhoneNumber()}
          style={[styles.btn, { width: Platform.select({ android: "100%" }) }]}
          activeOpacity={0.5}
        >
          REQUEST PHONE NUMBER CHANGE
        </Button>
      )}
    </View>
  );
}

export default ChangeUsername;
