import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import MomentUtils from "@date-io/moment";
import PropTypes from "prop-types";
import { HashRouter as Router } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { Provider } from "react-redux";
import { SnackbarProvider } from "notistack";
import { I18nextProvider } from "react-i18next";
import { createTheme, MuiThemeProvider } from "@material-ui/core/styles";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { store } from "./redux/store";
import { IntlProvider } from "react-intl";

import AppDrawer from "./shared/RawAppDrawer";
import AppToolBar from "./shared/RawAppToolBar";
import AppContent from "./shared/AppContent";
import SnackBarContainer from "./shared/snackBars/SnackBarContainer";
import PluginRegistry from "./core/PluginRegistry";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const rawTheme = {
  typography: {
      useNextVariants: true,
  },
  textColor: '#333',
  palette: {
      primary: {
          main: '#006699',
          secondary: '#0066cc',
          background: '#F5F5F5',
      },
      gray: {
          main: '#666',
          border: 'rgba(0,0,0,0.02)',
          background: 'rgba(0,0,0,0.03)',
      },
      mediumGray: {
          main: '#A2A2A2',
      },
      ligthGray: {
          main: '#F7F7F7',
          border: 'rgba(0, 0, 0, 0.12)',
          background: 'rgba(0, 0, 0, 0.012)',
      },
      error: {
          main: 'rgb(215, 25, 28)',
          background: 'rgba(215, 25, 28, 0.2)',
          backgroundHard: 'rgba(215, 25, 28, 0.7)',
      },
      success: {
          main: '#4caf50',
          background: 'rgba(#4caf50, 0.2)',
      },
  },
};

const defaultTheme = createTheme(rawTheme);

const App = ({ classes, incentivesDescriptors, dataElementGroups, drawerLinks, defaultPathName, children }) => {
  const registry = PluginRegistry;

  const invoices = registry.extension("invoices.invoices");
  const dhis2 = registry.extension("core.dhis2");
  const config = registry.extension("core.config");
  const i18n = registry.extension("core.i18n");
  const theme = registry.extension("core.theme")


  return (
    <IntlProvider messages={{}} locale="en" defaultLocale="en">
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <MuiThemeProvider theme={defaultTheme}>
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
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
                      <AppDrawer drawerLinks={drawerLinks} defaultPathName={defaultPathName || "/select"} />
                      <AppContent
                        dhis2={dhis2}
                        config={config}
                        invoices={invoices}
                        incentivesDescriptors={incentivesDescriptors}
                        dataElementGroups={dataElementGroups}
                      >{children}</AppContent>
                      
                    </div>
                  </div>
                </Router>
                <SnackBarContainer />
              </Provider>
            </SnackbarProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </I18nextProvider>
      </MuiThemeProvider>
    </MuiPickersUtilsProvider>
    </IntlProvider>
  );
};

App.propTypes = {
  classes: PropTypes.object.isRequired,
  incentivesDescriptors: PropTypes.any,
  dataElementGroups: PropTypes.any,
  drawerLinks: PropTypes.any,
  defaultPathName: PropTypes.any,
};

export default withStyles(styles)(App);
