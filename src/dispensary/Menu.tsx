import React, { useState, memo } from "react";
import {
  View,
  StyleSheet,
  Platform,
  ImageSourcePropType,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { ProductType } from "@potluckmarket/louis";
import { Icon } from "react-native-elements";
import { Tab, TabBar } from "react-native-ui-kitten";
import { CategoryIcon, ProductList, SearchHeader } from "./components";
import { useDimensions, stackHistory, RNWebComponent } from "common";
import { partialApplication } from "@potluckmarket/ella";
import { isBrowser, isMobile } from "react-device-detect";

interface MenuProps extends RNWebComponent {
  openModal?: (item: import("@potluckmarket/louis").InventoryItem) => void;
}

type Tab = {
  bgColor: string;
  icon: ImageSourcePropType;
  category: import("@potluckmarket/louis").ProductType;
};

const tabs: Tab[] = [
  {
    bgColor: "#46B060",
    icon: require("assets/images/Flower.png"),
    category: ProductType.Flower
  },
  {
    bgColor: "#1C1E1D",
    icon: require("assets/images/joints.png"),
    category: ProductType.PreRolls
  },
  {
    bgColor: "#4661B0",
    icon: require("assets/images/Edible.png"),
    category: ProductType.Edible
  },
  {
    bgColor: "#B09546",
    icon: require("assets/images/Concentrate.png"),
    category: ProductType.Concentrate
  },
  {
    bgColor: "#B04696",
    icon: require("assets/images/Topical.png"),
    category: ProductType.Topical
  }
];

function Menu(props: MenuProps) {
  const [selectedIndex, selectIndex] = useState(0);

  const store: import("@potluckmarket/louis").Store =
    Platform.OS === "web"
      ? props.location.state[0].store
      : props.navigation.getParam("store", {});

  const { heightToDP } = useDimensions();

  let navigateToWebURL;

  if (Platform.OS === "web") {
    navigateToWebURL = partialApplication(
      stackHistory,
      props.history,
      props.location.pathname
    );
  }

  function filterProductsByCategory(
    products: import("@potluckmarket/louis").InventoryItem[],
    category: import("@potluckmarket/louis").ProductType
  ) {
    return products.filter(product => product.productType === category);
  }

  function renderTabs() {
    return tabs.map((tab, index) => {
      const isTabActive: boolean = index === selectedIndex;

      return (
        <Tab
          key={index}
          // onPress={() => selectIndex(index)}
          icon={() => (
            <CategoryIcon
              containerStyle={{
                backgroundColor: tab.bgColor,
                opacity: isTabActive ? 1 : 0.5
              }}
              source={tab.icon}
              onPress={
                Platform.OS === "web" && isBrowser
                  ? null
                  : () => selectIndex(index)
              }
            />
          )}
          activeOpacity={0.5}
          style={styles.tab}
        />
      );
    });
  }

  return (
    <View style={{ height: heightToDP("100%") }}>
      <SearchHeader
        navigate={
          Platform.OS === "web" ? navigateToWebURL : props.navigation.navigate
        }
        products={
          store && store.inventory && store.inventory.items
            ? store.inventory.items
            : []
        }
        store={store}
        secondaryComponent={
          Platform.OS === "web" && !isMobile ? null : (
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === "web") {
                  props.history.goBack();
                } else {
                  props.navigation.goBack(null);
                }
              }}
              style={{ paddingRight: 10 }}
            >
              <Icon name="keyboard-backspace" size={30} color="black" />
            </TouchableOpacity>
          )
        }
      />

      <View style={{ flex: 1 }}>
        <TabBar
          selectedIndex={selectedIndex}
          onSelect={selectIndex}
          indicatorStyle={styles.indicator}
        >
          {Platform.OS === "web" ? (
            renderTabs()
          ) : (
            <ScrollView horizontal>{renderTabs()}</ScrollView>
          )}
        </TabBar>

        <ProductList
          products={filterProductsByCategory(
            store && store.inventory && store.inventory.items
              ? store.inventory.items
              : [],
            tabs[selectedIndex].category
          )}
          navigate={
            Platform.OS === "web" ? navigateToWebURL : props.navigation.navigate
          }
          store={store}
          openModal={props.openModal}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  indicator: {
    backgroundColor: "transparent"
    // width: "25%"
  },
  tab: {
    // flex: 1,
    padding: 10
  },
  tabBar: {}
});

export default memo(Menu);
