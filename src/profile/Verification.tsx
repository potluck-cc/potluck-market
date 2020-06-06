import React, { useState, useEffect, useContext, Fragment } from "react";
import {
  StyleSheet,
  Platform,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import { Text } from "@ui-kitten/components";
import { GenericButton, Lightbox, ButtonHeader } from "common/components";
import { askAsync, CAMERA_ROLL, PermissionStatus } from "expo-permissions";
import { launchImageLibraryAsync, MediaTypeOptions } from "expo-image-picker";
import { isBrowser, isMobile } from "react-device-detect";
import { moderateScale, scale } from "react-native-size-matters";
import { appsyncFetch, OperationType } from "@potluckmarket/ella";
import { UpdateUser } from "mutations";
import AppContext from "appcontext";
import { Storage, Auth } from "aws-amplify";
import {
  Colors,
  RNWebComponent,
  slugify,
  getLocationPermissions,
  getLocationAsync,
  getLocationRules,
  SupportedLocations,
  LocationRules
} from "common";

export default function(props: RNWebComponent) {
  const {
    currentAuthenticatedUser,
    client,
    setCurrentAuthenticatedUser
  } = useContext(AppContext);

  const [locationRules, setLocationRules] = useState<
    undefined | null | LocationRules
  >(null);

  const [
    locationPermissionStatus,
    setLocationPermissionStatus
  ] = useState<null | PermissionStatus>(null);

  const [performingStorageOperation, setPerformingStorageOperation] = useState(
    ""
  );

  const [stateId, setStateId] = useState(currentAuthenticatedUser.stateId);

  const [medCard, setMedCard] = useState(currentAuthenticatedUser.medCard);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const [activeImage, setActiveImage] = useState([]);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    await getLocationPermissions({
      onSuccess: async (status, permissions) => {
        await setLocationPermissionStatus(status);

        await getLocationAsync({
          onSuccess: location => {
            setLocationRules(
              getLocationRules(SupportedLocations[slugify(location[0].region)])
            );
          }
        });
      }
    });
  }

  async function getCameraPermissions() {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      const { status } = await askAsync(CAMERA_ROLL);
      return status;
    }
  }

  async function pickImage({ medical = false }: { medical: boolean }) {
    setPerformingStorageOperation(medical ? "medical" : "state");

    const status = await getCameraPermissions();

    if (status !== "granted" && Platform.OS !== "web") {
      setPerformingStorageOperation("");

      return alert(
        "You need provide access to your camera roll in order to upload an image!"
      );
    } else {
      const pickerResult = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0,
        exif: true,
        base64: true
      });

      if (!pickerResult.cancelled) {
        const imageName = pickerResult.uri.replace(/^.*[\\\/]/, "");
        const access = { level: "private", contentType: "image/jpeg" };
        const imageData = await fetch(pickerResult.uri);
        const blobData = await imageData.blob();
        await Storage.put(imageName, blobData, access);
        const currUser = await Auth.currentCredentials();
        const res = await fetch(
          "https://jlvnio6od8.execute-api.us-east-1.amazonaws.com/prod/presignurl",
          {
            method: "POST",
            body: JSON.stringify({
              identityId: currUser.identityId,
              fileName: imageName
            })
          }
        );

        const privateUrl = await res.json();

        let update = {};

        if (medical) {
          update["medCard"] = privateUrl;
          setMedCard(privateUrl);
        } else {
          update["stateId"] = privateUrl;
          setStateId(privateUrl);
        }

        if (currUser) {
          const res = await appsyncFetch({
            client,
            operationType: OperationType.mutation,
            document: UpdateUser,
            variables: {
              id: currentAuthenticatedUser.id,
              ...update
            }
          });

          if (res && res.updateUser) {
            setCurrentAuthenticatedUser(res.updateUser);
          }
        } else {
          return alert("Something went wrong, please try again.");
        }
      }
    }
    setPerformingStorageOperation("");
  }

  return locationPermissionStatus !== "granted" ? (
    <View
      style={{ justifyContent: "center", alignItems: "center", marginTop: 50 }}
    >
      <Text style={{ textAlign: "center", fontSize: moderateScale(12) }}>
        In order to determine what identification is required for the
        dispensaries in your area to process your orders, we'll need access to
        your location.
      </Text>
      <GenericButton
        buttonText="Locate Me"
        onPress={initialize}
        style={{ marginTop: 30 }}
      />
    </View>
  ) : (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.container}>
        {Platform.OS !== "web" && (
          <ButtonHeader
            onBackBtnPress={() => props.navigation.goBack(null)}
            containerStyle={{ alignSelf: "flex-start" }}
          />
        )}

        {locationRules ? (
          <View style={styles.btnContainer}>
            {performingStorageOperation === "state" ? (
              <View style={styles.imageContainer}>
                <ActivityIndicator size="small" color={Colors.medGreen} />
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setActiveImage([stateId]);
                  setIsLightboxOpen(true);
                }}
                disabled={!stateId}
                style={styles.imageContainer}
              >
                <Image
                  source={{
                    uri: stateId
                      ? stateId
                      : "https://via.placeholder.com/150x150.png?text=Your+Id+Goes+Here"
                  }}
                  style={styles.idImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}

            <GenericButton
              buttonText="Upload State Identification"
              onPress={async () => await pickImage({ medical: false })}
              style={styles.btn}
            />

            {locationRules.medical && (
              <Fragment>
                {performingStorageOperation === "medical" ? (
                  <View style={styles.imageContainer}>
                    <ActivityIndicator size="small" color={Colors.medGreen} />
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setActiveImage([medCard]);
                      setIsLightboxOpen(true);
                    }}
                    disabled={!medCard}
                    style={styles.imageContainer}
                  >
                    <Image
                      source={{
                        uri: medCard
                          ? medCard
                          : "https://via.placeholder.com/150x150.png?text=Your+Id+Goes+Here"
                      }}
                      style={styles.idImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}

                <GenericButton
                  buttonText="Upload Medical Marijuana Card"
                  onPress={async () => await pickImage({ medical: true })}
                  style={styles.btn}
                />
              </Fragment>
            )}
          </View>
        ) : (
          <View style={styles.imageContainer}>
            <ActivityIndicator size="small" color={Colors.medGreen} />
          </View>
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.text}>
            To make an order on Potluck Market, we require you to upload images
            of the necessary identification so that the dispensary you're
            ordering from can verify whether or not they are legally able to
            service you.
          </Text>

          <Text style={styles.text}>
            The type of identification you will have to upload will depend on
            the local laws of the dispensary you're ordering from, specifically
            whether or not you're in a legal or a medical state.
          </Text>

          <Text style={styles.text}>
            The images you upload will only be visible to you and the dispensary
            with which you're placing your order.
          </Text>

          <Text style={styles.text}>
            Please ensure that you're images are taken in a well-lit room and
            that the details on your card(s) are easily legible.
          </Text>
        </View>

        <Lightbox
          isImageModalVisible={isLightboxOpen}
          images={activeImage}
          close={() => setIsLightboxOpen(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingHorizontal: Platform.select({
      default: null,
      web: (isBrowser && isMobile && 200) || null
    }),
    alignItems: "center"
  },
  disclaimer: {
    paddingHorizontal: Platform.select({
      web: isMobile ? undefined : 40
    })
  },
  text: {
    paddingVertical: scale(5),
    fontSize: moderateScale(12)
  },
  imageContainer: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  idImage: {
    height: "100%",
    width: "100%"
  },
  btnContainer: {
    alignItems: "center",
    justifyContent: "space-between",
    width: Platform.select({
      default: "100%",
      web: (isBrowser && "50%") || "100%"
    }),
    minHeight: 100,
    marginTop: Platform.select({
      web: isMobile ? undefined : 20,
      ios: 50,
      android: 50
    })
  },
  btn: {
    width: "100%",
    marginVertical: 10
  }
});
