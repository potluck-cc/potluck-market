import React from "react";
import { FluidNavigator } from "react-navigation-fluid-transitions";
import DispensariesList from "./DispensariesList";
import SingleDispensary from "./SingleDispensary";

type DispensaryTransitionProps = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

const DispensaryNavigator = FluidNavigator(
  {
    Dispensaries: { screen: DispensariesList },
    Store: { screen: SingleDispensary }
  },
  {
    defaultNavigationOptions: {
      gesturesEnabled: true
    }
  }
);

export default class DispensaryTransition extends React.Component<
  DispensaryTransitionProps
> {
  static router = DispensaryNavigator.router;

  render() {
    const { navigation } = this.props;
    return <DispensaryNavigator navigation={navigation} />;
  }
}
