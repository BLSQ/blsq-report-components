import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Switch, withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";

import { setCurrentUser } from "../redux/actions/currentUser";
import { setCurrentPeriod } from "../redux/actions/period";

import ExtensionsComponent from "../core/ExtensionsComponent";
import PluginRegistry from "../core/PluginRegistry";

import DatePeriods from "../../support/DatePeriods";

import { drawerWidth } from "./RawAppDrawer";
import LoadingSpinner from "./LoadingSpinner";

const styles = (theme) => ({
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  "content-left": {
    marginLeft: -drawerWidth,
  },
  "content-right": {
    marginRight: -drawerWidth,
  },
  "@media print": {
    "content-left": {
      marginLeft: 0,
    },
    appFrame: {
      display: "block",
    },
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  "contentShift-left": {
    marginLeft: 0,
  },
  "contentShift-right": {
    marginRight: 0,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "8px 8px",
    ...theme.mixins.toolbar,
  },
});

class AppContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topLevelsOrgUnits: [],
    };
  }

  componentDidMount() {
    this.fetchCurrentUser();
  }

  async fetchCurrentUser() {
    const { dhis2, dispatch } = this.props;
    const user = await dhis2.currentUserRaw();
    const topLevelsOrgUnits = await dhis2.getTopLevels([2, 3]);

    const api = await dhis2.api();
    for (const plugin of PluginRegistry.allPlugins()) {
      if (plugin.initializer) {
        await plugin.initializer({ api, user });
      }
    }
    PluginRegistry.resetExtenstionCache();
    dispatch(setCurrentUser(user));
    this.setState({
      topLevelsOrgUnits: topLevelsOrgUnits,
    });
  }

  render() {
    const {
      classes,
      dhis2,
      config,
      invoices,
      incentivesDescriptors,
      dataElementGroups,
      currentUser,
      isLoading,
      dispatch,
      drawerOpen,
      period,
    } = this.props;

    const frequency = period.includes("S") ? "sixMonthly" : "quarterly";
    const params = {
      config,
      dhis2,
      period: DatePeriods.split(period, frequency)[0],
      onPeriodChange: dispatch(setCurrentPeriod),
      invoices,
      currentUser,
      incentivesDescriptors,
      dataElementGroups,
      topLevelsOrgUnits: this.state.topLevelsOrgUnits,
    };

    return (
      <main
        className={classNames(classes.content, classes[`content-left`], {
          [classes.contentShift]: drawerOpen,
          [classes[`contentShift-left`]]: drawerOpen,
        })}
      >
        {(!currentUser || isLoading) && <LoadingSpinner />}
        <div className={classes.drawerHeader + " no-print"} />
        {currentUser && (
          <Switch>
            <ExtensionsComponent extensionKey="core.routes" {...params} />
          </Switch>
        )}
      </main>
    );
  }
}

AppContent.defaultProps = {
  currentUser: undefined,
};

AppContent.propTypes = {
  classes: PropTypes.object.isRequired,
  dhis2: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  invoices: PropTypes.any.isRequired,
  incentivesDescriptors: PropTypes.any.isRequired,
  dataElementGroups: PropTypes.any.isRequired,
  currentUser: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  drawerOpen: PropTypes.bool.isRequired,
  period: PropTypes.string.isRequired,
};

const MapStateToProps = (state) => ({
  currentUser: state.currentUser.profile,
  isLoading: state.load.isLoading,
  drawerOpen: state.drawer.isOpen,
  period: state.period.current,
});

const MapDispatchToProps = (dispatch) => ({
  dispatch,
});

export default withRouter(
  withStyles(styles)(connect(MapStateToProps, MapDispatchToProps)(AppContent)),
);
