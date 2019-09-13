import React, { useContext } from "react";

import { Linking, View, Platform, StyleSheet } from "react-native";
import AppContext from "appcontext";
import { Auth } from "aws-amplify";

import { Divider } from "common/components";
import { Text, ListItem } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";
import { Signin } from "auth";
import { scale, moderateScale } from "react-native-size-matters";

function Settings({ navigation }) {
  const { currentAuthenticatedUser, setCurrentAuthenticatedUser } = useContext(
    AppContext
  );

  if (!currentAuthenticatedUser) {
    return <Signin navigation={navigation} />;
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginTop: 30,
          marginBottom: 30
        }}
      >
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

      <ListItem
        onPress={() => navigation.navigate("ChangeUsername")}
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
        onPress={() => navigation.navigate("ChangeAttributes")}
        titleStyle={styles.title}
        title="Update Details"
        icon={() => <Icon name="update" type="material-community" size={30} />}
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
        onPress={() => navigation.navigate("ForgotPassword")}
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
          <Icon name="file-document-box" type="material-community" size={30} />
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
        icon={() => <Icon name="logout" type="material-community" size={30} />}
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
  );
}

const styles = StyleSheet.create({
  title: { fontSize: moderateScale(12) },
  container: { flex: 1, padding: scale(30) }
});

export default Settings;
