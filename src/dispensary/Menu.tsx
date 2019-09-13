import React, { useState, memo, Fragment } from "react";
import {
  View,
  StyleSheet,
  Platform,
  ImageSourcePropType,
  TouchableOpacity
} from "react-native";
import { ProductType } from "@potluckmarket/louis";
import { Icon } from "react-native-elements";
import { TabView, Tab, TabBar } from "react-native-ui-kitten";
import { CategoryIcon, ProductList, SearchHeader } from "./components";
import { Colors, isIphoneXorAbove } from "common";

type Tab = {
  bgColor: string;
  icon: ImageSourcePropType;
  category: import("@potluckmarket/louis").ProductType;
};

type MenuProps = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

const tabs: Tab[] = [
  {
    bgColor: "#46B060",
    icon: require("assets/images/Flower.png"),
    category: ProductType.Flower
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

function Menu({ navigation: { navigate, getParam, goBack } }: MenuProps) {
  const [selectedIndex, selectIndex] = useState(0);

  const store: import("@potluckmarket/louis").Store = getParam("store", null);

  function filterProductsByCategory(
    products: import("@potluckmarket/louis").InventoryItem[],
    category: import("@potluckmarket/louis").ProductType
  ) {
    return products.filter(product => product.productType === category);
  }

  function renderTabs() {
    return tabs.map((tab, index) => {
      const isTabActive: boolean = index === selectedIndex;

      if (Platform.OS === "android") {
        return (
          <Tab
            key={index}
            icon={() => (
              <CategoryIcon
                containerStyle={{
                  backgroundColor: tab.bgColor,
                  opacity: isTabActive ? 1 : 0.8
                }}
                source={tab.icon}
              />
            )}
            activeOpacity={0.5}
            style={styles.tab}
          ></Tab>
        );
      }

      return (
        <Tab
          key={index}
          icon={() => (
            <CategoryIcon
              containerStyle={{
                backgroundColor: tab.bgColor,
                opacity: isTabActive ? 1 : 0.6
              }}
              source={tab.icon}
            />
          )}
          activeOpacity={0.5}
          style={styles.tab}
        >
          <ProductList
            products={filterProductsByCategory(
              store && store.inventory && store.inventory.items
                ? store.inventory.items
                : [],
              tab.category
            )}
            navigate={navigate}
            store={store}
          />
        </Tab>
      );
    });
  }

  return (
    <Fragment>
      <SearchHeader
        navigate={navigate}
        products={
          store && store.inventory && store.inventory.items
            ? store.inventory.items
            : []
        }
        store={store}
        secondaryComponent={
          <TouchableOpacity
            onPress={() => goBack(null)}
            style={{ paddingRight: 10 }}
          >
            <Icon name="keyboard-backspace" size={30} color="black" />
          </TouchableOpacity>
        }
      />
      {Platform.OS === "android" ? (
        <View style={{ flex: 1 }}>
          <TabBar
            selectedIndex={selectedIndex}
            onSelect={selectIndex}
            indicatorStyle={styles.indicator}
            // tabBarStyle={styles.tabBar}
            // shouldLoadComponent={index =>
            //   index === selectedIndex ? true : false
            // }
          >
            {renderTabs()}
          </TabBar>

          <ProductList
            products={filterProductsByCategory(
              store && store.inventory && store.inventory.items
                ? store.inventory.items
                : [],
              tabs[selectedIndex].category
            )}
            navigate={navigate}
            store={store}
          />
        </View>
      ) : (
        <TabView
          selectedIndex={selectedIndex}
          onSelect={selectIndex}
          style={styles.tabView}
          indicatorStyle={styles.indicator}
          tabBarStyle={styles.tabBar}
          shouldLoadComponent={index =>
            index === selectedIndex ? true : false
          }
        >
          {renderTabs()}
        </TabView>
      )}
    </Fragment>
  );
}

const styles = StyleSheet.create({
  tabView: {
    flex: 1,
    paddingBottom: 75
  },
  indicator: {
    backgroundColor: Colors.green,
    width: "25%"
  },
  tab: {
    flex: 1,
    padding: 10
  },
  tabBar: {}
});

export default memo(Menu);
