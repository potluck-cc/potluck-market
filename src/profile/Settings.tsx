import React, { useContext } from "react";

import { Linking, View, Platform, StyleSheet } from "react-native";
import AppContext from "appcontext";
import { Auth } from "aws-amplify";
import { useDimensions, RNWebComponent } from "common";
import { Divider } from "common/components";
import { Text, ListItem } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";
import { Signin } from "auth";
import { scale, moderateScale } from "react-native-size-matters";
import { isBrowser } from "react-device-detect";

function Settings(props: RNWebComponent) {
  const { currentAuthenticatedUser, setCurrentAuthenticatedUser } = useContext(
    AppContext
  );

  const { widthToDP } = useDimensions();

  if (!currentAuthenticatedUser) {
    return (
      <Signin
        navigation={props.navigation}
        {...{
          history: props.history,
          location: props.location,
          match: props.match
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.detailContainer}>
        <Text category="h1">
          {currentAuthenticatedUser.__typename === "Doctor"
            ? currentAuthenticatedUser.name
            : `${currentAuthenticatedUser.firstname} ${currentAuthenticatedUser.lastname}`}
        </Text>

        {currentAuthenticatedUser.__typename === "User" && (
          <Text category="s1">{currentAuthenticatedUser.email}</Text>
        )}

        <Text category="s1">{currentAuthenticatedUser.phone}</Text>
      </View>

      <View
        style={[
          styles.listContainer,
          {
            width: Platform.select({
              web: isBrowser ? widthToDP("50%") : widthToDP("95%"),
              ios: "100%",
              android: "100%"
            })
          }
        ]}
      >
        <ListItem
          onPress={() => {
            if (Platform.OS === "web") {
              props.history.push("/verification");
            } else {
              props.navigation.navigate("Verification");
            }
          }}
          titleStyle={styles.title}
          title="Upload Identification"
          icon={() => (
            <Icon name="checkbox-marked-circle-outline" type="material-community" size={30} />
          )}
          accessory={() => (
            <Icon
              name="chevron-double-right"
              type="material-community"
              size={15}
            />
          )}
        />

        <Divider />

        <ListItem
          onPress={() => {
            if (Platform.OS === "web") {
              props.history.push("/changenumber");
            } else {
              props.navigation.navigate("ChangeUsername");
            }
          }}
          titleStyle={styles.title}
          title="Update Phone Number"
          icon={() => (
            <Icon name="cellphone" type="material-community" size={30} />
          )}
          accessory={() => (
            <Icon
              name="chevron-double-right"
              type="material-community"
              size={15}
            />
          )}
        />

        <Divider />

        <ListItem
          onPress={() => {
            if (Platform.OS === "web") {
              props.history.push("/updateprofile");
            } else {
              props.navigation.navigate("ChangeAttributes");
            }
          }}
          titleStyle={styles.title}
          title="Update Profile"
          icon={() => (
            <Icon name="update" type="material-community" size={30} />
          )}
          accessory={() => (
            <Icon
              name="chevron-double-right"
              type="material-community"
              size={15}
            />
          )}
        />

        <Divider />

        <ListItem
          onPress={() => {
            if (Platform.OS === "web") {
              props.history.push("/changepassword");
            } else {
              props.navigation.navigate("ForgotPassword");
            }
          }}
          titleStyle={styles.title}
          title="Change Password"
          icon={() => (
            <Icon name="lock-reset" type="material-community" size={30} />
          )}
          accessory={() => (
            <Icon
              name="chevron-double-right"
              type="material-community"
              size={15}
            />
          )}
        />

        <Divider />

        <ListItem
          onPress={() =>
            Linking.openURL("https://potluckmarket.com/blog/privacy_policy")
          }
          titleStyle={styles.title}
          title="Privacy Policy"
          icon={() => (
            <Icon
              name="file-document-box"
              type="material-community"
              size={30}
            />
          )}
          accessory={() => (
            <Icon
              name="chevron-double-right"
              type="material-community"
              size={15}
            />
          )}
        />

        <Divider />

        <ListItem
          onPress={async () => {
            await Auth.signOut();
            await setCurrentAuthenticatedUser(null);
          }}
          titleStyle={styles.title}
          title="Logout"
          icon={() => (
            <Icon name="logout" type="material-community" size={30} />
          )}
          accessory={() => (
            <Icon
              name="chevron-double-right"
              type="material-community"
              size={15}
            />
          )}
        />

        <Divider />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: moderateScale(12) },
  container: {
    flex: 1,
    padding: scale(30),
    alignItems: "center"
  },
  detailContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30
  },
  listContainer: {}
});

export default Settings;
