import React, { useEffect, useState, Fragment } from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform
} from "react-native";
import styles from "./defaultStyles";
import { Input, Button, Text, Layout } from "@ui-kitten/components";
import { Icon } from "react-native-elements";
import { AvoidKeyboard } from "common/components";
import Confirm from "./Confirm";
import { Colors, isIphoneXorAbove, RNWebComponent } from "common";
import { ButtonHeader } from "common/components";
import { useAuth, useForm } from "@potluckmarket/ella";
import { Auth } from "aws-amplify";
import { isBrowser } from "react-device-detect";

function SignUp(props: RNWebComponent) {
  const {
    handleSignUp,
    loading,
    handleStateChange,
    americanizePhoneNumber,
    username,
    password,
    hidePassword,
    error,
    normalizePhoneStringInput
  } = useAuth(Auth);

  const fields = [
    {
      type: "text",
      fieldName: "firstname",
      value: null,
      required: true,
      error: false
    },
    {
      type: "text",
      fieldName: "lastname",
      value: "",
      required: true,
      error: false
    },
    {
      type: "text",
      fieldName: "email",
      value: "",
      required: true,
      error: false
    }
  ];

  const {
    generateFieldValues,
    updateFieldByName,
    areRequiredFieldsDirty
  } = useForm(fields);

  const { firstname, lastname, email } = generateFieldValues();

  const [requiredError, setRequiredError] = useState(false);

  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {
    const { retrieveData } = await import("@potluckmarket/ella");
    const signedUp = await retrieveData("signedUp");

    if (signedUp) {
      if (Platform.OS === "web") {
        setConfirm(true);
      } else {
        props.navigation.navigate("Confirm");
      }
    }
  }

  function handleError(error): void {
    if (error.includes("username")) {
      handleStateChange(
        "error",
        "You must use a valid phone number without any parentheses, hyphens or spaces."
      );
    } else if (error.includes("phone_number")) {
      handleStateChange(
        "error",
        "You must use a valid phone number without any parentheses, hyphens or spaces."
      );
    } else {
      handleStateChange("error", error);
    }
  }

  const [offset, setOffset] = useState(0);

  function getKeyboardOffset(height: number): number {
    return Platform.select({
      ios: isIphoneXorAbove() ? 5 : offset,
      android: offset
    });
  }

  async function onSubmit() {
    if (!areRequiredFieldsDirty()) {
      handleSignUp(
        {
          username: americanizePhoneNumber(normalizePhoneStringInput(username)),
          password: password,
          attributes: {
            "custom:email": email.toLowerCase(),
            "custom:firstname": firstname,
            "custom:lastname": lastname
          }
        },
        async () => {
          const { storeData } = await import("@potluckmarket/ella");
          await storeData("signedUp", "true");
          await storeData("username", username);

          if (Platform.OS === "web") {
            setConfirm(true);
          } else {
            props.navigation.navigate("Confirm");
          }
        },
        error => handleError(typeof error === "string" ? error : error.message)
      );
      setRequiredError(false);
    } else {
      setRequiredError(true);
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
    <Fragment>
      {Platform.OS !== "web" && (
        <ButtonHeader onBackBtnPress={() => props.navigation.goBack(null)} />
      )}

      <ScrollView
        style={{
          flex: 1,
          marginTop: Platform.select({
            android: 60,
            ios: isIphoneXorAbove() ? 100 : 60
          }),
          paddingBottom: 5
        }}
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Layout style={styles.container}>
          <AvoidKeyboard autoDismiss offset={getKeyboardOffset}>
            <Input
              size="large"
              label="Phone Number"
              onChangeText={text => handleStateChange("username", text)}
              value={username}
              style={styles.input}
              keyboardType={
                Platform.OS === "web" && isBrowser
                  ? "numeric"
                  : Platform.OS !== "web"
                  ? "numeric"
                  : null
              }
              returnKeyType="done"
              icon={({ tintColor }) => (
                <Icon
                  name="cellphone"
                  type="material-community"
                  color={error ? "red" : requiredError ? "red" : tintColor}
                  size={30}
                />
              )}
            />

            <Input
              size="large"
              label="Email"
              onChangeText={text => updateFieldByName("email", text)}
              value={email}
              style={styles.input}
              returnKeyType="done"
              icon={({ tintColor }) => (
                <Icon
                  name="at"
                  type="material-community"
                  color={error ? "red" : requiredError ? "red" : tintColor}
                  size={30}
                />
              )}
            />

            <Input
              size="large"
              label="First Name"
              onChangeText={text => updateFieldByName("firstname", text)}
              value={firstname}
              style={styles.input}
              returnKeyType="done"
              icon={({ tintColor }) => (
                <Icon
                  name="format-color-text"
                  type="material-community"
                  color={error ? "red" : requiredError ? "red" : tintColor}
                  size={30}
                />
              )}
            />
            <Input
              size="large"
              label="Last Name"
              onChangeText={text => updateFieldByName("lastname", text)}
              value={lastname}
              style={styles.input}
              returnKeyType="done"
              onFocus={() => setOffset(40)}
              onBlur={() => setOffset(0)}
              icon={({ tintColor }) => (
                <Icon
                  name="format-color-text"
                  type="material-community"
                  color={error ? "red" : requiredError ? "red" : tintColor}
                  size={30}
                />
              )}
            />

            <Input
              size="large"
              label="Password"
              onChangeText={text => handleStateChange("password", text)}
              secureTextEntry={hidePassword}
              style={styles.input}
              value={password}
              returnKeyType="done"
              onFocus={() => setOffset(100)}
              onBlur={() => setOffset(0)}
              icon={({ tintColor }) => (
                <TouchableOpacity
                  onPress={() =>
                    handleStateChange("hidePassword", !hidePassword)
                  }
                >
                  <Icon
                    name={hidePassword ? "eye-off" : "eye"}
                    type="material-community"
                    color={error ? "red" : requiredError ? "red" : tintColor}
                    size={25}
                  />
                </TouchableOpacity>
              )}
            />
          </AvoidKeyboard>

          {loading ? (
            <ActivityIndicator color={Colors.green} style={styles.loader} />
          ) : (
            <Button
              onPress={onSubmit}
              style={[styles.btn, styles.center]}
              activeOpacity={0.5}
            >
              SIGN UP
            </Button>
          )}

          <Text style={[styles.errorText, styles.center]}>{error}</Text>

          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === "web") {
                props.history.push("/signin");
              } else {
                props.navigation.navigate("Signin", {
                  isSecondaryScreen: true
                });
              }
            }}
            style={styles.center}
          >
            <Text>Sign In</Text>
          </TouchableOpacity>
        </Layout>
      </ScrollView>
    </Fragment>
  );
}

export default SignUp;
