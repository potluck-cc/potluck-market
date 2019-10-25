import React, { useEffect, useContext, Dispatch } from "react";
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
import { UpdateUser } from "mutations";
import AppContext from "appcontext";
import { Colors, RNWebComponent } from "common";
import { ButtonHeader } from "common/components";
import { isBrowser } from "react-device-detect";

interface ConfirmProps extends RNWebComponent {
  verifyAttribute?: boolean;
  setConfirm?: Dispatch<boolean>;
}

function Confirm(props: ConfirmProps) {
  const { currentAuthenticatedUser, client } = useContext(AppContext);

  const verifyAttribute =
    Platform.OS === "web"
      ? props.verifyAttribute
      : props.navigation.getParam("verifyAttribute", false);

  const {
    loading,
    handleConfirmAccount,
    handleResendConfirmationEmail,
    handleConfirmPasswordChange,
    handleVerifyChangeAttribute,
    username,
    password,
    code,
    error,
    forgotPassword,
    hidePassword,
    handleStateChange,
    americanizePhoneNumber,
    normalizePhoneStringInput
  } = useAuth(Auth);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {
    const { retrieveData } = await import("@potluckmarket/ella");
    const username = await retrieveData("username");
    const forgotPassword = await retrieveData("forgotPassword");

    if (username) {
      handleStateChange(
        "username",
        typeof username === "string" ? username : ""
      );
    }

    if (forgotPassword) {
      handleStateChange(
        "forgotPassword",
        forgotPassword === "true" ? true : false
      );
    }
  }

  async function onSubmit(): Promise<void> {
    if (forgotPassword && !verifyAttribute) {
      handleConfirmPasswordChange(
        {
          username: americanizePhoneNumber(normalizePhoneStringInput(username)),
          password: password,
          code: code
        },
        async () => {
          const { destroyData } = await import("@potluckmarket/ella");
          await destroyData("forgotPassword");
          if (Platform.OS === "web") {
            props.history.push("/signin");
          } else {
            props.navigation.navigate("Signin");
          }
        },
        error =>
          handleStateChange(
            "error",
            typeof error === "string" ? error : error.message
          )
      );
    } else if (verifyAttribute) {
      handleVerifyChangeAttribute(
        {
          attribute: "phone_number",
          code: code
        },
        async res => {
          const {
            retrieveData,
            destroyData,
            appsyncFetch,
            OperationType
          } = await import("@potluckmarket/ella");

          const changeUsername = await retrieveData("changeUsernameRequested");
          const changeEmail = await retrieveData("changeEmail");

          if (changeUsername) {
            await appsyncFetch({
              client,
              document: UpdateUser,
              operationType: OperationType.mutation,
              variables: {
                id: currentAuthenticatedUser.id,
                phone: changeUsername
              }
            });

            await destroyData("changeUsernameRequested");
          }

          if (changeEmail) {
            await appsyncFetch({
              client,
              document: UpdateUser,
              operationType: OperationType.mutation,
              variables: {
                id: currentAuthenticatedUser.id,
                email: changeEmail
              }
            });
          }

          if (Platform.OS === "web") {
            props.history.push("/signin");
          } else {
            props.navigation.navigate("Signin");
          }
        },
        error => {
          handleStateChange(
            "error",
            typeof error === "string" ? error : error.message
          );
        }
      );
    } else {
      handleConfirmAccount(
        {
          username: americanizePhoneNumber(normalizePhoneStringInput(username)),
          code: code,
          password: password
        },
        async () => {
          const { destroyData } = await import("@potluckmarket/ella");
          await destroyData("signedUp");
          if (Platform.OS === "web") {
            props.history.push("/signin");
          } else {
            props.navigation.navigate("Signin");
          }
        },
        error =>
          handleStateChange(
            "error",
            typeof error === "string" ? error : error.message
          )
      );
    }
  }

  async function cancel() {
    if (forgotPassword && !verifyAttribute) {
      const { destroyData } = await import("@potluckmarket/ella");
      await destroyData("requestSent");
    } else if (verifyAttribute && !forgotPassword) {
      const { destroyData } = await import("@potluckmarket/ella");
      await destroyData("changeUsernameRequested");
    } else {
      const { destroyData } = await import("@potluckmarket/ella");
      await destroyData("signedUp");
    }

    if (Platform.OS === "web") {
      props.setConfirm(false);
    } else {
      props.navigation.goBack();
    }
  }

  function renderCancelText() {
    if (forgotPassword && !verifyAttribute) {
      return (
        <TouchableOpacity onPress={() => cancel()}>
          <Text>Cancel Forgot Password Request</Text>
        </TouchableOpacity>
      );
    } else if (verifyAttribute && !forgotPassword) {
      return (
        <TouchableOpacity onPress={() => cancel()}>
          <Text>Cancel Phone Number Change Request</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity onPress={() => cancel()}>
          <Text>Sign Up With A Different Number</Text>
        </TouchableOpacity>
      );
    }
  }

  return (
    <View style={styles.container}>
      {Platform.OS !== "web" && (
        <ButtonHeader
          onBackBtnPress={() => props.navigation.goBack(null)}
          containerStyle={{ alignSelf: "flex-start" }}
        />
      )}

      {!verifyAttribute ? (
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
      ) : null}

      {forgotPassword ? (
        <Input
          size="large"
          label={verifyAttribute ? "Password" : "New Password"}
          onChangeText={text => handleStateChange("password", text)}
          style={styles.input}
          value={password}
          secureTextEntry={hidePassword}
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
      ) : null}

      <Input
        size="large"
        label="Code"
        onChangeText={text => handleStateChange("code", text)}
        style={styles.input}
        value={code}
        keyboardType="numeric"
        returnKeyType="done"
        icon={({ tintColor }) => (
          <Icon
            name="numeric"
            type="material-community"
            color={error ? "red" : tintColor}
            size={30}
          />
        )}
      />

      {loading ? (
        <ActivityIndicator size="small" color={Colors.green} />
      ) : (
        <Button
          onPress={() => onSubmit()}
          style={styles.btn}
          activeOpacity={0.5}
        >
          CONFIRM
        </Button>
      )}

      <Text style={styles.errorText}>{error}</Text>

      {Platform.OS === "web" && renderCancelText()}

      {verifyAttribute && !forgotPassword && (
        <TouchableOpacity
          onPress={() =>
            handleResendConfirmationEmail(
              {
                username: americanizePhoneNumber(
                  normalizePhoneStringInput(username)
                )
              },
              () => {},
              error =>
                handleStateChange(
                  "error",
                  typeof error === "string" ? error : error.message
                )
            )
          }
        >
          <Text>Resend Code</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => {
          if (Platform.OS === "web") {
            props.history.push("/signin");
          } else {
            props.navigation.navigate("SignIn");
          }
        }}
      >
        <Text>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Confirm;
