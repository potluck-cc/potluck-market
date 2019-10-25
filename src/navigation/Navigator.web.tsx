import React, { Fragment, useContext } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import AppContext from "appcontext";
import {
  DispensariesList,
  SingleDispensary,
  Menu,
  Product,
  SearchResults
} from "dispensary";
import {
  Signin,
  Signup,
  ForgotPassword,
  ChangeAttributes,
  ChangeUsername
} from "auth";
import { Settings } from "profile";
import { Menu as Topbar } from "antd";
import { isMobile } from "react-device-detect";
import "./web.css";
import "antd/dist/antd.css";
import "react-image-lightbox/style.css";
import "semantic-ui-css/semantic.min.css";

function DefaultLayout({ component: Component, ...rest }) {
  const { currentAuthenticatedUser } = useContext(AppContext);

  // console.log(currentAuthenticatedUser);

  window.scrollTo(0, 0);

  return (
    <Route
      {...rest}
      render={matchProps => (
        <Fragment>
          <Topbar
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={[
              matchProps.location.pathname === "/" ||
              matchProps.location.pathname.includes("dispensary")
                ? "1"
                : "2"
            ]}
            style={{ lineHeight: "64px", backgroundColor: "#46B060" }}
          >
            <Topbar.Item disabled>
              <a>potluck.</a>
            </Topbar.Item>
            <Topbar.Item key="1">
              <Link to="/">Dispensaries</Link>
            </Topbar.Item>
            {currentAuthenticatedUser ? (
              <Topbar.Item key="2">
                <Link to="/settings">Settings</Link>
              </Topbar.Item>
            ) : (
              <Topbar.Item key="2">
                <Link to="/signin">Sign In</Link>
              </Topbar.Item>
            )}
          </Topbar>
          <Component {...matchProps} />
        </Fragment>
      )}
    />
  );
}

function AppRouter() {
  return (
    <Router>
      <Fragment>
        <DefaultLayout path="/" exact component={DispensariesList} />
        {isMobile ? (
          <Route exact path="/dispensary/:slug" component={SingleDispensary} />
        ) : (
          <DefaultLayout
            exact
            path="/dispensary/:slug"
            component={SingleDispensary}
          />
        )}
        <Route exact path="/dispensary/:slug/menu" component={Menu} />
        <Route
          exact
          path="/dispensary/:slug/menu/product/:slug"
          component={Product}
        />
        <DefaultLayout
          exact
          path="/dispensary/:slug/menu/search/:query"
          component={SearchResults}
        />
        <DefaultLayout path="/signin" component={Signin} />
        <DefaultLayout path="/signup" component={Signup} />
        <DefaultLayout path="/forgotpassword" component={ForgotPassword} />
        <DefaultLayout path="/settings" component={Settings} />
        <DefaultLayout path="/changenumber" component={ChangeUsername} />
        <DefaultLayout path="/updateprofile" component={ChangeAttributes} />
        <DefaultLayout path="/changepassword" component={ForgotPassword} />
      </Fragment>
    </Router>
  );
}

export default AppRouter;
