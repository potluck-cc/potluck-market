import React, { useContext } from "react";
import { StyleSheet, ScrollView, View, Platform } from "react-native";
import { Text, Button } from "react-native-ui-kitten";
import { Card, TextHeader } from "common/components";
import { Colors, isIphoneXorAbove, isTablet } from "common";
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

  return (
    <ScrollView style={styles.container}>
      <TextHeader title="Login With" subtitle="Potluck" />

      <View style={styles.cards}>
        <Card
          localImage={require("assets/images/potluckmed_android.png")}
          title="Potluck MED"
          description="Find and chat with medical professionals to get your medical marijuana card"
          resizeMode="cover"
          containerStyle={{ minHeight: scale(350) }}
        />
      </View>

      <View style={styles.action}>
        <Text style={styles.actionText}>
          You can use your Potluck Market account to sign into any of the above
          apps!
        </Text>

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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.eggShell,
    paddingTop: Platform.select({
      ios: isIphoneXorAbove() ? 50 : 30,
      android: 30
    })
  },
  cards: {
    alignItems: "center",
    flex: 1
  },
  action: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  actionText: {
    textAlign: "center",
    fontSize: scale(14),
    padding: isTablet() ? scale(5) : 0,
    lineHeight: scale(20)
  },
  btn: {
    width: "50%",
    marginTop: 10,
    backgroundColor: Colors.green,
    borderColor: Colors.green,
    marginBottom: 50
  }
});
