import React, { useEffect, useContext } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform
} from "react-native";

import styles from "./defaultStyles";
import { Input, Button, Text } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";

import { useAuth } from "@potluckmarket/ella";
import { Auth } from "aws-amplify";

import { Colors, RNWebComponent } from "common";
import { ButtonHeader } from "common/components";
import AppContext from "appcontext";
import { isBrowser } from "react-device-detect";

function SignIn(props: RNWebComponent) {
  const { initializeApp, currentAuthenticatedUser } = useContext(AppContext);
  const {
    handleLogin,
    loading,
    handleStateChange,
    americanizePhoneNumber,
    username,
    error,
    hidePassword,
    password,
    normalizePhoneStringInput
  } = useAuth(Auth);

  const isSecondaryScreen: string =
    Platform.OS !== "web"
      ? props.navigation.getParam("isSecondaryScreen", null)
      : null;

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {
    if (Platform.OS === "web" && currentAuthenticatedUser) {
      props.history.push("/settings");
    }

    const { retrieveData } = await import("@potluckmarket/ella");
    const username = await retrieveData("username");

    if (username) {
      handleStateChange("username", username);
    }
  }

  return (
    <View style={styles.container}>
      {isSecondaryScreen && (
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
        status={error ? "danger" : null}
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

      <Input
        size="large"
        label="Password"
        onChangeText={text => handleStateChange("password", text)}
        secureTextEntry={hidePassword}
        style={styles.input}
        value={password}
        status={error ? "danger" : null}
        returnKeyType="done"
        icon={({ tintColor }) => (
          <TouchableOpacity
            onPress={() => handleStateChange("hidePassword", !hidePassword)}
          >
            <Icon
              name={hidePassword ? "eye-off" : "eye"}
              type="material-community"
              color={error ? "red" : tintColor}
              size={25}
            />
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator
          size="small"
          color={Colors.green}
          style={styles.loader}
        />
      ) : (
        <Button
          onPress={async () => {
            await handleLogin(
              {
                username: americanizePhoneNumber(
                  normalizePhoneStringInput(username)
                ),
                password: password
              },
              async res => {
                if (
                  res.challengeName &&
                  res.challengeName === "NEW_PASSWORD_REQUIRED"
                ) {
                  await Auth.completeNewPassword(res, password);
                }

                const { storeData } = await import("@potluckmarket/ella");

                await storeData("username", username);

                await initializeApp(res);

                if (isSecondaryScreen) {
                  props.navigation.navigate("PotluckSuite");
                }

                if (Platform.OS === "web") {
                  props.history.push("/settings");
                }
              },
              error => {
                if (typeof error === "string") {
                  handleStateChange("error", error);
                } else {
                  handleStateChange("error", error.message);
                }
              }
            );
          }}
          style={styles.btn}
          activeOpacity={0.5}
        >
          SIGN IN
        </Button>
      )}

      <Text style={styles.errorText}>{error}</Text>

      <TouchableOpacity
        onPress={() => {
          if (Platform.OS === "web") {
            props.history.push("/signup");
          } else {
            props.navigation.navigate("Signup");
          }
        }}
      >
        <Text>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          if (Platform.OS === "web") {
            props.history.push("/forgotpassword");
          } else {
            props.navigation.navigate("ForgotPassword");
          }
        }}
      >
        <Text>Forgot Password</Text>
      </TouchableOpacity>
    </View>
  );
}

export default SignIn;
