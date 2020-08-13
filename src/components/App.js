import React from "react";
import PropTypes from "prop-types";
import { HashRouter as Router } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { Provider } from "react-redux";

import { store } from "./redux/store";

import AppDrawer from "./shared/RawAppDrawer";
import AppToolBar from "./shared/RawAppToolBar";
import AppContent from "./shared/AppContent";

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  appFrame: {
    height: "100%",
    minHeight: "100vh",
    zIndex: 1,
    overflow: "auto",
    position: "relative",
    display: "flex",
    width: "100%",
  },
  hide: {
    display: "none",
  },
});

class App extends React.Component {
  render() {
    const {
      classes,
      dhis2,
      config,
      invoices,
      incentivesDescriptors,
      dataElementGroups,
      drawerLinks,
      defaultPathName,
    } = this.props;

    return (
      <Provider store={store}>
        <Router>
          <div className={classes.root}>
            <div className={classes.appFrame}>
              <AppToolBar />
              <AppDrawer
                drawerLinks={drawerLinks}
                defaultPathName={defaultPathName || "/select"}
              />
              <AppContent
                dhis2={dhis2}
                config={config}
                invoices={invoices}
                incentivesDescriptors={incentivesDescriptors}
                dataElementGroups={dataElementGroups}
              />
            </div>
          </div>
        </Router>
      </Provider>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  dhis2: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  invoices: PropTypes.any.isRequired,
  incentivesDescriptors: PropTypes.any,
  dataElementGroups: PropTypes.any,
  drawerLinks: PropTypes.any,
  defaultPathName: PropTypes.any,
};

export default withStyles(styles)(App);
