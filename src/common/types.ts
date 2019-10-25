import { RouteComponentProps } from "react-router-dom";

export interface RNWebComponent extends RouteComponentProps {
    navigation?: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
    >;
}
