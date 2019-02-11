import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import AccountCircle from "@material-ui/icons/AccountCircle";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";

import browseDataRoute from "./browsedata/BrowseDataRoute";
import incentiveRoute from "./incentives/IncentiveRoute";
import invoiceRoutes from "./invoices/invoiceRoutes";

import DatePeriods from "../support/DatePeriods";

import { Typography } from "@material-ui/core";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Dashboard from "@material-ui/icons/Dashboard";
import FileIcon from "@material-ui/icons/InsertDriveFile";
import { withNamespaces } from "react-i18next";
const drawerWidth = 240;

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  flex: {
    flexGrow: 1
  },
  imageStyle: {
    height: "20px"
  },
  appFrame: {
    height: "100%",
    zIndex: 1,
    overflow: "auto",
    position: "relative",
    display: "flex",
    width: "100%"
  },
  appBar: {
    position: "absolute",
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  "appBarShift-left": {
    marginLeft: drawerWidth
  },
  "appBarShift-right": {
    marginRight: drawerWidth
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20
  },
  hide: {
    display: "none"
  },
  drawerPaper: {
    position: "relative",
    width: drawerWidth
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  "content-left": {
    marginLeft: -drawerWidth
  },
  "content-right": {
    marginRight: -drawerWidth
  },
  "@media print": {
    "content-left": {
      marginLeft: 0
    }
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  "contentShift-left": {
    marginLeft: 0
  },
  "contentShift-right": {
    marginRight: 0
  }
});

const RawAppDrawer = props => {
  const DrawerLinks = props.drawerLinks || React.Fragment;
  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={props.open}
      className="no-print"
      classes={{
        paper: props.classes.drawerPaper
      }}
    >
      <div className={props.classes.drawerHeader}>
        <IconButton onClick={props.handleDrawerClose}>
          <ChevronLeftIcon />
        </IconButton>
      </div>
      <Divider />
      <List onClick={props.handleDrawerClose}>
        <ListItem button component="a" href="/">
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component="a" href="./index.html#/select">
          <ListItemIcon>
            <FileIcon />
          </ListItemIcon>
          <ListItemText primary={props.t("report_and_invoices")} />
        </ListItem>
        <Divider />
        <DrawerLinks period={props.period} />
      </List>
    </Drawer>
  );
};
const AppDrawer = withNamespaces()(RawAppDrawer);

class RawAppToolBar extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.currentUser !== nextProps.currentUser;
  }

  render() {
    const { classes, open, currentUser, handleDrawerOpen, t } = this.props;
    return (
      <Toolbar disableGutters={!open}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          className={classNames(classes.menuButton, open && classes.hide)}
        >
          <MenuIcon />
        </IconButton>
        <Button aria-label="Menu" href="/">
          <img
            src="https://www.dhis2.org/sites/all/themes/dhis/logo.png"
            className={classes.imageStyle}
            alt="dhis2"
          />
        </Button>
        <Typography variant="title" color="inherit" className={classes.flex}>
          {t("app_name")}
        </Typography>

        <Typography
          variant="title"
          color="inherit"
          title={
            currentUser &&
            "manage " +
              currentUser.organisationUnits.map(ou => ou.name).join(", ") +
              " and view " +
              currentUser.dataViewOrganisationUnits
                .map(ou => ou.name)
                .join(", ")
          }
        >
          {currentUser && currentUser.name}
        </Typography>
        <div>
          <IconButton
            aria-owns="menu-appbar"
            aria-haspopup="true"
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
        </div>
      </Toolbar>
    );
  }
}

const AppToolBar = withNamespaces()(RawAppToolBar);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      period: DatePeriods.currentQuarter(),

      open: false,
      orgUnits: [],
      currentUser: this.props.user
    };
    this.onPeriodChange = this.onPeriodChange.bind(this);
    this.fetchCurrentUser();
  }

  async fetchCurrentUser() {
    const user = await this.props.dhis2.currentUserRaw();
    const topLevelsOrgUnits = await this.props.dhis2.getTopLevels([2, 3]);
    this.setState({
      currentUser: user,
      topLevelsOrgUnits: topLevelsOrgUnits
    });
  }

  onPeriodChange(period) {
    if (period === this.state.period) {
      return;
    }
    console.log("Changing period to " + period);
    this.setState({ period: period });
  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes, t } = this.props;
    const { open } = this.state;

    const frequency = this.state.period.includes("S")
      ? "sixMonthly"
      : "quarterly";
    const params = {
      config: this.props.config,
      dhis2: this.props.dhis2,
      period: DatePeriods.split(this.state.period, frequency)[0],
      onPeriodChange: this.onPeriodChange,
      invoices: this.props.invoices,
      currentUser: this.state.currentUser,
      incentivesDescriptors: this.props.incentivesDescriptors,
      dataElementGroups: this.props.dataElementGroups,
      topLevelsOrgUnits: this.state.topLevelsOrgUnits
    };

    return (
      <Router>
        <div className={classes.root}>
          <div className={classes.appFrame}>
            <AppBar
              className={
                classNames(classes.appBar, {
                  [classes.appBarShift]: open,
                  [classes[`appBarShift-left`]]: open
                }) + " no-print"
              }
            >
              <AppToolBar
                classes={classes}
                open={open}
                currentUser={this.state.currentUser}
                handleDrawerOpen={this.handleDrawerOpen}
              />
            </AppBar>
            <AppDrawer
              classes={classes}
              open={open}
              handleDrawerClose={this.handleDrawerClose}
              drawerLinks={this.props.drawerLinks}
              period={this.state.period}
            />
            <main
              className={classNames(classes.content, classes[`content-left`], {
                [classes.contentShift]: open,
                [classes[`contentShift-left`]]: open
              })}
            >
              <div className={classes.drawerHeader + " no-print"} />
              <Switch>
                {[browseDataRoute(params), incentiveRoute(params)]}
                {invoiceRoutes(params)}
                {this.props.routes && this.props.routes(params)}
              </Switch>
            </main>
          </div>
        </div>
      </Router>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(withNamespaces()(App));
