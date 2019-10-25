import React, { useContext } from "react";
import { StyleSheet, ScrollView, View, Platform } from "react-native";
import { Text, Button } from "react-native-ui-kitten";
import { Card, TextHeader } from "common/components";
import { Colors, isIphoneXorAbove, isTablet, useDimensions } from "common";
import AppContext from "appcontext";
import { scale } from "react-native-size-matters";

type PotluckSuiteProps = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

export default function PotluckSuite({
  navigation: { navigate }
}: PotluckSuiteProps) {
  const { currentAuthenticatedUser } = useContext(AppContext);
  const { heightToDP } = useDimensions();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        alignItems: "center"
      }}
    >
      <TextHeader title="Login With" subtitle="Potluck" />

      <Card
        localImage={require("assets/images/potluckmed_android.png")}
        description="Find and chat with medical professionals to get your medical marijuana card"
        resizeMode="cover"
        containerStyle={{ height: heightToDP("60%") }}
        descriptionStyle={{ lineHeight: isTablet() ? 30 : 20 }}
      />

      <View style={{ margin: 15 }}>
        <Text style={styles.actionText}>
          You can use your Potluck Market account to sign into any of the apps
          on our platform.
        </Text>
      </View>

      {!currentAuthenticatedUser && (
        <Button
          style={styles.btn}
          activeOpacity={0.8}
          onPress={() =>
            navigate("Signup", {
              isSecondaryScreen: true
            })
          }
        >
          SIGN UP
        </Button>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.eggShell,
    paddingTop: Platform.select({
      ios: isIphoneXorAbove() ? 50 : 30,
      android: 30
    })
  },
  cards: {
    // alignItems: "center",
  },
  action: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  actionText: {
    textAlign: "center",
    fontSize: scale(14),
    // padding: isTablet() ? scale(5) : 0,
    lineHeight: scale(18)
    // margin: 20
  },
  btn: {
    // width: "50%",
    marginTop: 10,
    backgroundColor: Colors.green,
    borderColor: Colors.green,
    marginBottom: 50
  }
});
