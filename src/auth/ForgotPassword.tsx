import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import Confirm from "./Confirm";

import styles from "./defaultStyles";
import { Input, Button, Text } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";

import { useAuth } from "@potluckmarket/ella";
import { Auth } from "aws-amplify";
import { Colors, RNWebComponent } from "common";
import { ButtonHeader } from "common/components";
import { isBrowser } from "react-device-detect";

function ForgotPassword(props: RNWebComponent) {
  const {
    handleForgotPasswordRequest,
    loading,
    handleStateChange,
    americanizePhoneNumber,
    username,
    error,
    normalizePhoneStringInput
  } = useAuth(Auth);

  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {
    const { retrieveData } = await import("@potluckmarket/ella");
    const username = await retrieveData("username");

    if (username) {
      handleStateChange("username", username);
    }
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
        label="Phone Number"
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

      {loading ? (
        <ActivityIndicator color={Colors.green} style={styles.loader} />
      ) : (
        <Button
          onPress={() =>
            handleForgotPasswordRequest(
              {
                username: americanizePhoneNumber(
                  normalizePhoneStringInput(String(username))
                )
              },
              async () => {
                const { storeData } = await import("@potluckmarket/ella");
                await storeData("forgotPassword", "true");

                if (Platform.OS === "web") {
                  setConfirm(true);
                } else {
                  props.navigation.navigate("Confirm");
                }
              },
              error =>
                handleStateChange(
                  "error",
                  typeof error === "string" ? error : error.message
                )
            )
          }
          style={styles.btn}
          activeOpacity={0.5}
        >
          REQUEST PASSWORD CHANGE
        </Button>
      )}

      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
}

export default ForgotPassword;
