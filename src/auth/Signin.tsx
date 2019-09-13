import React, { useEffect, useContext } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";

import styles from "./defaultStyles";
import { Input, Button, Text } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";

import { useAuth } from "@potluckmarket/ella";
import { Auth } from "aws-amplify";

import { Colors } from "common";
import { ButtonHeader } from "common/components";
import AppContext from "appcontext";

type Props = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

function SignIn({ navigation: { navigate, goBack, getParam, state } }: Props) {
  const { initializeApp } = useContext(AppContext);
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

  const isSecondaryScreen: string = getParam("isSecondaryScreen", null);

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

  return (
    <View style={styles.container}>
      {isSecondaryScreen && (
        <ButtonHeader
          onBackBtnPress={() => goBack(null)}
          containerStyle={{ alignSelf: "flex-start" }}
        />
      )}

      <Input
        size="large"
        label="Phone Number"
        onChangeText={text => handleStateChange("username", text)}
        style={styles.input}
        value={username}
        keyboardType="numeric"
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
          onPress={async () =>
            await handleLogin(
              {
                username: americanizePhoneNumber(
                  normalizePhoneStringInput(username)
                ),
                password: password
              },
              async res => {
                await initializeApp(res);

                if (isSecondaryScreen) {
                  navigate("PotluckSuite");
                }
              },
              error => {
                if (typeof error === "string") {
                  handleStateChange("error", error);
                } else {
                  handleStateChange("error", error.message);
                }
              }
            )
          }
          style={styles.btn}
          activeOpacity={0.5}
        >
          SIGN IN
        </Button>
      )}

      <Text style={styles.errorText}>{error}</Text>

      <TouchableOpacity onPress={() => navigate("Signup")}>
        <Text>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigate("ForgotPassword")}>
        <Text>Forgot Password</Text>
      </TouchableOpacity>
    </View>
  );
}

export default SignIn;
