import React, {
  useState,
  memo,
  useEffect,
  useCallback,
  useContext
} from "react";
import {
  View,
  StyleSheet,
  Platform,
  ImageSourcePropType,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ViewStyle
} from "react-native";
import { ProductType } from "@potluckmarket/louis";
import { Icon } from "react-native-elements";
import { Tab, TabBar, Text } from "@ui-kitten/components";
import { CategoryIcon, ProductList, SearchHeader } from "./components";
import {
  useDimensions,
  RNWebComponent,
  Colors,
  slugify,
  isTablet
} from "common";
import { useLazyAppSyncQuery, OperationType } from "@potluckmarket/ella";
import { isMobile, isIOS13 } from "react-device-detect";
import { Cart } from "cart";
import Modal from "modal-enhanced-react-native-web";
import { Product } from "product";
import { setCurrentlyShoppingStore } from "actions";
import { useDispatch } from "react-redux";
import AppContext from "appcontext";
import { GetStoreInventory } from "queries";
import { getStoreWithMetadata } from "./functions";
import { scale } from "react-native-size-matters";

interface MenuProps extends RNWebComponent {
  openModal?: (item: import("@potluckmarket/types").InventoryItem) => void;
  store?: import("@potluckmarket/types").Store;
}

type Tab = {
  bgColor: string;
  icon: ImageSourcePropType;
  category: import("@potluckmarket/types").ProductType;
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

function Loader({ containerStyle = {} }: { containerStyle?: ViewStyle }) {
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        backgroundColor: "#F7F9FC",
        ...containerStyle
      }}
    >
      <ActivityIndicator size="small" color={Colors.green} />
    </View>
  );
}

function Menu(props: MenuProps) {
  const { client } = useContext(AppContext);

  const storeFromState: import("@potluckmarket/types").Store =
    Platform.OS === "web"
      ? (props.location.state &&
          props.location.state.length &&
          props.location.state[0].store) ||
        props.store
      : props.navigation.getParam("store", props.store);

  const [store, setStore] = useState(storeFromState);

  const [selectedIndex, selectIndex] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);

  const [activeMenuItem, setActiveMenuItem] = useState<
    import("@potluckmarket/types").InventoryItem | null
  >(null);

  const [inventory, setInventory] = useState<
    import("@potluckmarket/types").InventoryItem[] | []
  >([]);

  const [query, setQuery] = useState("");

  const [refetching, setRefetching] = useState(false);

  const [res, loading, fetchInventory] = useLazyAppSyncQuery({
    client,
    operationType: OperationType.query,
    document: GetStoreInventory,
    fetchPolicy: "network-only"
  });

  const dispatch = useDispatch();

  const setCurrentStore = useCallback(
    store => dispatch(setCurrentlyShoppingStore(store)),
    [dispatch]
  );

  const { heightToDP, isLandscape, isPortrait } = useDimensions();

  useEffect(() => {
    initialize();

    return () => {
      setCurrentStore(null);
    };
  }, []);

  useEffect(() => {
    if (store) {
      setCurrentStore(store);
      grabMenu();
    }
  }, [store]);

  useEffect(() => {
    if (
      res &&
      res.getStoreInventoryWithFilters &&
      res.getStoreInventoryWithFilters.items
    ) {
      setInventory(currItems => {
        if (refetching) {
          return [...res.getStoreInventoryWithFilters.items];
        } else {
          return [...currItems, ...res.getStoreInventoryWithFilters.items];
        }
      });
    }

    return () => {
      setRefetching(false);
    };
  }, [res]);

  useEffect(() => {
    if (store) {
      setRefetching(true);
      grabMenu();
    }
  }, [query, selectedIndex]);

  async function grabMenu() {
    const category = tabs[selectedIndex].category.toLowerCase();
    const metadata = query.length
      ? `${category}-${slugify(query)}`.trim()
      : category;

    await fetchInventory({
      storeId: store.id,
      metadata
    });
  }

  async function initialize() {
    if (!store) {
      let metadata;

      if (Platform.OS === "web") {
        const {
          match: {
            params: { location, slug, product }
          }
        } = props;
        metadata = `${location}-${slug}`;

        await getStoreWithMetadata({
          metadata,
          client,
          onSuccess: store => setStore(store),
          onFailure: () => {
            if (Platform.OS === "web") {
              props.history.push("/");
            }
          }
        });

        if (product && product.length) {
          try {
            const path = window.location.pathname;
            const productFromURL = path.substring(path.lastIndexOf("/") + 1);
            const decodedURI = decodeURIComponent(productFromURL);
            const parsedProduct = JSON.parse(decodedURI);
            setActiveMenuItem(parsedProduct);
            setModalOpen(true);
          } catch (e) {
            console.log(e);
          }
        }
      }
    }
  }

  function openModal(item: import("@potluckmarket/types").InventoryItem) {
    setActiveMenuItem(item);
    setModalOpen(true);
  }

  function renderTabs(selectedIndex) {
    return tabs.map((tab, index) => {
      const isTabActive: boolean = index === selectedIndex;

      return (
        <Tab
          key={index}
          icon={() => (
            <CategoryIcon
              containerStyle={{
                backgroundColor: tab.bgColor,
                opacity: isTabActive ? 1 : 0.5
              }}
              source={tab.icon}
              onPress={() => selectIndex(index)}
            />
          )}
          activeOpacity={0.5}
          style={styles.tab}
        />
      );
    });
  }

  return (
    <View
      style={{
        height: Platform.select({
          default: heightToDP("100%"),
          web: isMobile || isIOS13 ? "100%" : heightToDP("100%")
        }),
        backgroundColor: Platform.select({
          default: Colors.medGreen,
          web: isMobile || isIOS13 ? Colors.medGreen : undefined
        })
      }}
    >
      <SearchHeader
        onSearch={query => setQuery(query)}
        renderRight={() =>
          Platform.OS === "web" && !isMobile && !isTablet() ? (
            <Cart
              navigate={
                Platform.OS === "web"
                  ? props.history.push
                  : props.navigation.navigate
              }
            />
          ) : null
        }
        renderLeft={() =>
          Platform.OS === "web" && !isMobile && !isTablet() ? null : (
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === "web") {
                  props.history.push(
                    `/dispensary/usa-${store.state.toLowerCase()}-${store.city.toLowerCase()}/${
                      store.slug
                    }`
                  );
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

      <View
        style={{
          height: Platform.select({
            default: heightToDP("100%"),
            web:
              isTablet() && isPortrait
                ? heightToDP("80%")
                : isMobile || isIOS13
                ? isLandscape
                  ? heightToDP("70%")
                  : heightToDP("75%")
                : "90%"
          }),
          borderBottomEndRadius: Platform.select({
            default: 30,
            web: isMobile || isIOS13 ? 30 : 0
          }),
          borderBottomStartRadius: Platform.select({
            default: 30,
            web: isMobile || isIOS13 ? 30 : 0
          }),
          overflow: "hidden"
        }}
      >
        {!res || (!Object.keys(res).length && loading) ? (
          <Loader />
        ) : (
          <ProductList
            products={refetching ? [] : inventory}
            navigate={Platform.OS !== "web" ? props.navigation.navigate : null}
            store={store}
            openModal={Platform.OS === "web" ? openModal : null}
            refetching={refetching}
            header={
              <TabBar
                selectedIndex={selectedIndex}
                indicatorStyle={styles.indicator}
                onSelect={selectIndex}
              >
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {renderTabs(selectedIndex)}
                </ScrollView>
              </TabBar>
            }
            footer={
              refetching ? (
                <Loader
                  containerStyle={{
                    height: heightToDP("50%")
                  }}
                />
              ) : !inventory.length ? (
                <View
                  style={{
                    height: heightToDP("50%"),
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Text style={{ fontSize: scale(10) }} category="h6">
                    No results found
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      {Platform.OS === "web" ? (
        isMobile || isIOS13 ? (
          <Cart
            navigate={
              Platform.OS === "web"
                ? props.history.push
                : props.navigation.navigate
            }
          />
        ) : null
      ) : null}

      {Platform.OS === "web" && (
        <Modal
          isVisible={modalOpen}
          coverScreen
          style={{
            padding: 0,
            margin: 0
          }}
        >
          {activeMenuItem && (
            <Product
              product={activeMenuItem}
              store={store}
              {...props}
              goBack={() => setModalOpen(false)}
            />
          )}
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  indicator: {
    backgroundColor: "transparent"
  },
  tab: {
    padding: 10,
    height: Platform.select({
      web: "inherit"
    })
  },
  tabBar: {}
});

export default memo(Menu);
