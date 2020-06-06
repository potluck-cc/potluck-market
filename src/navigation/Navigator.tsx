import React from "react";

import {
  createSwitchNavigator,
  createAppContainer,
  createBottomTabNavigator,
  createStackNavigator
} from "react-navigation";

import { Icon } from "react-native-elements";
import { Colors } from "common";

import { DispensaryTransition, Menu, SearchResults } from "dispensary";
import {
  Signin,
  Signup,
  ForgotPassword,
  Confirm,
  ChangeAttributes,
  ChangeUsername
} from "auth";

import { Product } from "product";

import { PreviousOrders } from "orders";

import { Settings, Verification } from "profile";

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

const OrderStack = createStackNavigator(
  {
    PreviousOrders,
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
          name="text-document"
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
    Verification,
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

const App = createBottomTabNavigator(
  {
    HomeStack,
    OrderStack,
    ProfileStack
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
