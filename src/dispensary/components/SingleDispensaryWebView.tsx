import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Platform
} from "react-native";
import { Tabs } from "antd";
import { useDimensions, isTablet } from "common";
import { Text } from "react-native-ui-kitten";
import { Menu } from "dispensary";
import { scale } from "react-native-size-matters";
import { isBrowser } from "react-device-detect";
import { Modal } from "semantic-ui-react";
import { Product } from "product";

const { TabPane } = Tabs;

function ImageHeader({ image }: { image: string | null }) {
  const { dimensions, heightToDP } = useDimensions();

  const styles = StyleSheet.create({
    container: {
      borderBottomColor: "black",
      borderBottomWidth: 1
    },
    storefrontImage: {
      height: heightToDP("40%"),
      width: dimensions.width
    }
  });

  return (
    <View style={styles.container}>
      <Image
        source={
          image ? { uri: image } : require("assets/images/potluck_default.png")
        }
        style={styles.storefrontImage}
        resizeMode="contain"
      />
    </View>
  );
}

function StoreDetails({ store, children }) {
  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 30,
      paddingVertical: 30,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "left"
    }
  });

  return (
    <View style={styles.container}>
      <View style={{ textAlign: "center" }}>
        <TouchableOpacity onPress={() => Linking.openURL(`${store.link}`)}>
          <Text category="h2">{store.name}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Linking.openURL(
              `http://maps.google.com/maps?daddr=${store.latitude},${store.longitude}`
            );
          }}
        >
          <Text>{`${store.street} ${store.city}, ${store.state} ${store.zip}`}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL(`tel:${store.phone}`)}>
          <Text>{store.phone}</Text>
        </TouchableOpacity>
      </View>

      {children}
    </View>
  );
}

export default function SingleDispensaryWebView({
  renderHours,
  store,
  ...rest
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState<
    import("@potluckmarket/types").InventoryItem | null
  >(null);

  function openModal(item: import("@potluckmarket/types").InventoryItem) {
    setActiveMenuItem(item);
    setModalOpen(true);
  }

  return (
    <View style={styles.container}>
      <ImageHeader image={store.logo} />
      <Tabs defaultActiveKey="2" onChange={() => {}}>
        <TabPane tab="Info" key="1">
          <StoreDetails store={store}>
            <View style={styles.hours}>{renderHours(store.hours)}</View>
          </StoreDetails>
        </TabPane>
        <TabPane tab="Menu" key="2">
          <Menu
            {...{
              history: rest.history,
              location: rest.location,
              match: rest.match
            }}
            openModal={openModal}
            store={store}
          />
        </TabPane>
      </Tabs>

      <Modal
        open={modalOpen}
        closeIcon
        onClose={() => setModalOpen(false)}
        scrolling
      >
        {activeMenuItem && (
          <Modal.Content>
            <Product
              {...{
                history: rest.history,
                location: rest.location,
                match: rest.match
              }}
              store={store}
              product={activeMenuItem}
            />
          </Modal.Content>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  hours: {
    paddingHorizontal: 30,
    paddingVertical: 30
  },
  text: {
    fontSize: Platform.select({
      ios: scale(14),
      android: scale(14),
      web: isBrowser ? 16 : scale(14)
    }),
    padding: isTablet() ? scale(5) : 3
  }
});
