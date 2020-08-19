import React from "react";
import PropTypes from "prop-types";
import { HashRouter as Router } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { Provider } from "react-redux";
import { SnackbarProvider } from "notistack";

import { store } from "./redux/store";

import AppDrawer from "./shared/RawAppDrawer";
import AppToolBar from "./shared/RawAppToolBar";
import AppContent from "./shared/AppContent";
import SnackBarContainer from "./shared/snackBars/SnackBarContainer";

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
});

const App = ({
  classes,
  dhis2,
  config,
  invoices,
  incentivesDescriptors,
  dataElementGroups,
  drawerLinks,
  defaultPathName,
}) => (
  <SnackbarProvider
    maxSnack={3}
    autoHideDuration={4000}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
  >
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
          <SnackBarContainer />
        </div>
      </Router>
    </Provider>
  </SnackbarProvider>
);

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
