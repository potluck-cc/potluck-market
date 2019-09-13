import React, { useState } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { Icon } from "react-native-elements";
import { Input } from "react-native-ui-kitten";
import { Colors, isIphoneXorAbove } from "common";

type SearchHeaderProps = {
  products: import("@potluckmarket/louis").InventoryItem[];
  store: import("@potluckmarket/louis").Store;
  navigate: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >["navigate"];
  secondaryComponent?: JSX.Element;
};

function SearchHeader({
  secondaryComponent,
  products,
  store,
  navigate
}: SearchHeaderProps) {
  const [query, setQuery] = useState("");

  function onSubmitSearch() {
    if (query.length) {
      navigate("SearchResults", {
        searchQuery: query,
        products,
        store
      });
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.SearchBarContainer}>
        {secondaryComponent && (
          <View style={styles.secondaryComponent}>{secondaryComponent}</View>
        )}
        <View style={styles.SearchBar}>
          <Input
            placeholder="Search"
            placeholderTextColor="grey"
            style={styles.defaultTextInput}
            returnKeyType="search"
            onChangeText={text => setQuery(text)}
            value={query}
            onSubmitEditing={onSubmitSearch}
            onIconPress={onSubmitSearch}
            icon={style => {
              return (
                <Icon
                  iconStyle={{ paddingRight: 5 }}
                  name="ios-search"
                  type="ionicon"
                  color={Colors.green}
                  size={20}
                />
              );
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingTop: Platform.select({
      ios: isIphoneXorAbove() ? 25 : null
    })
  },
  SearchBarContainer: {
    height: 50,
    backgroundColor: "white",
    marginTop: 10,
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly"
  },
  SearchBar: {
    paddingRight: 10,
    flexDirection: "row",
    backgroundColor: "white",
    width: "85%"
  },
  secondaryComponent: {
    width: "15%",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  defaultTextInput: {
    flex: 1,
    fontWeight: "700",
    backgroundColor: "white",
    borderColor: Colors.green
  }
});

export default SearchHeader;
