import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Switch } from "react-router-dom";
import { connect } from "react-redux";
import Dhis2Icon from "./icons/Dhis2Icon";
import { Typography, IconButton, Button, Toolbar, AppBar } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

import AccountCircle from "@material-ui/icons/AccountCircle";
import MenuIcon from "@material-ui/icons/Menu";

import { withTranslation } from "react-i18next";
import ExtensionsComponent from "../core/ExtensionsComponent";

import { setIsOpenDrawer } from "../redux/actions/drawer";
import { drawerWidth } from "./RawAppDrawer";

const styles = (theme) => ({
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "8px 8px",
    ...theme.mixins.toolbar,
  },
  flex: {
    flexGrow: 1,
  },
  imageStyle: {
    height: "20px",
  },
  menuButton: {
    marginLeft: 12,
  },
  appBar: {
    position: "absolute",
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarItem: {
    paddingLeft: "30px",
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  "appBarShift-left": {
    marginLeft: drawerWidth,
  },
  "appBarShift-right": {
    marginRight: drawerWidth,
  },
});
class RawAppToolBar extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.currentUser !== nextProps.currentUser || this.props.drawerOpen !== nextProps.drawerOpen;
  }

  render() {
    const { classes, drawerOpen, currentUser, t, dispatch } = this.props;
    return (
      <AppBar
        className={
          classNames(classes.appBar, {
            [classes.appBarShift]: drawerOpen,
            [classes[`appBarShift-left`]]: drawerOpen,
          }) + " no-print"
        }
      >
        <Toolbar disableGutters={!drawerOpen} className={classes.drawerHeader}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => dispatch(setIsOpenDrawer(!drawerOpen))}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Button aria-label="Menu" href="/" className={classes.appBarItem} variant="h6" color="inherit">
            <Dhis2Icon /> &nbsp;&nbsp;Dhis2
          </Button>
   
          <Switch>
            <ExtensionsComponent extensionKey="core.headerRoutes" {...this.props} />
          </Switch>

          <div id="portal-header"  color="inherit"  className={classNames(classes.flex, classes.appBarItem)}></div>

          <Typography
            variant="inherit"
            color="inherit"
            title={
              currentUser &&
              "manage " +
                currentUser.organisationUnits.map((ou) => ou.name).join(", ") +
                " and view " +
                currentUser.dataViewOrganisationUnits.map((ou) => ou.name).join(", ")
            }
          >
            {currentUser && currentUser.name}
          </Typography>
          <div>
            <IconButton aria-owns="menu-appbar" aria-haspopup="true" color="inherit">
              <AccountCircle />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

RawAppToolBar.defaultProps = {
  currentUser: undefined,
};

RawAppToolBar.propTypes = {
  classes: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
  drawerOpen: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const MapStateToProps = (state) => ({
  currentUser: state.currentUser.profile,
  drawerOpen: state.drawer.isOpen,
});

const MapDispatchToProps = (dispatch) => ({
  dispatch,
});

export default withTranslation()(withStyles(styles)(connect(MapStateToProps, MapDispatchToProps)(RawAppToolBar)));
