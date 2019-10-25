import React from "react";

import {
  createSwitchNavigator,
  createAppContainer,
  createBottomTabNavigator,
  createStackNavigator
} from "react-navigation";

import { Icon } from "react-native-elements";
import { Colors } from "common";

import { DispensaryTransition, Menu, Product, SearchResults } from "dispensary";
import {
  Signin,
  Signup,
  ForgotPassword,
  Confirm,
  ChangeAttributes,
  ChangeUsername
} from "auth";

import { Settings } from "profile";

import { PotluckSuite } from "ads";

const HomeStack = createStackNavigator(
  {
    DispensaryTransition,
    Menu,
    Product,
    SearchResults
  },
  {
    defaultNavigationOptions: {
      header: null
    },
    navigationOptions: {
      tabBarIcon: ({ focused }) => (
        <Icon
          name="shop"
          type="entypo"
          color={focused ? Colors.green : "white"}
          size={25}
        />
      )
    }
  }
);

const ProfileStack = createStackNavigator(
  {
    Settings,
    Signin,
    ChangeUsername,
    ChangeAttributes,
    ForgotPassword,
    Confirm,
    Signup
  },
  {
    defaultNavigationOptions: {
      header: null
    },
    navigationOptions: {
      tabBarIcon: ({ focused }) => (
        <Icon
          name="settings"
          type="material-community"
          color={focused ? Colors.green : "white"}
          size={25}
        />
      )
    }
  }
);

const AdsStack = createStackNavigator(
  {
    PotluckSuite,
    Signin,
    Signup,
    Confirm,
    ForgotPassword
  },
  {
    defaultNavigationOptions: {
      header: null
    },
    navigationOptions: {
      tabBarIcon: ({ focused }) => (
        <Icon
          name="layers"
          type="material-community"
          color={focused ? Colors.green : "white"}
          size={25}
        />
      )
    }
  }
);

const App = createBottomTabNavigator(
  {
    HomeStack,
    ProfileStack,
    AdsStack
  },
  {
    tabBarOptions: {
      showLabel: false,
      style: {
        backgroundColor: Colors.darkGreen
      }
    }
  }
);

export default createAppContainer(
  createSwitchNavigator(
    {
      Main: App
    },
    { initialRouteName: "Main" }
  )
);
