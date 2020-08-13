import React from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";

import { Divider, List, Drawer, makeStyles } from "@material-ui/core";

import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Dashboard from "@material-ui/icons/Dashboard";

import { withNamespaces } from "react-i18next";
import ExtensionsComponent from "../core/ExtensionsComponent";
import { setIsOpenDrawer } from "../redux/actions/drawer";

const DefaultDrawerLinks = (props) => {
  return <span />;
};

export const drawerWidth = 240;

const styles = (theme) => ({
  drawerPaper: {
    position: "relative",
    width: drawerWidth,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "8px 8px",
    ...theme.mixins.toolbar,
  },
});

const useStyles = makeStyles((theme) => styles(theme));
const RawAppDrawer = (props) => {
  const { drawerLinks } = props;
  const drawerOpen = useSelector((state) => state.drawer.isOpen);
  const period = useSelector((state) => state.period.current);
  const dispatch = useDispatch();
  const DrawerLinks = drawerLinks || DefaultDrawerLinks;
  const classes = useStyles();

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={drawerOpen}
      className="no-print"
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.drawerHeader}>
        <IconButton onClick={() => dispatch(setIsOpenDrawer(false))}>
          <ChevronLeftIcon />
        </IconButton>
      </div>
      <Divider />
      <List onClick={() => dispatch(setIsOpenDrawer(false))}>
        <ListItem button component="a" href="/">
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>

        <Divider />
        <DrawerLinks period={period} />
        <ExtensionsComponent extensionKey="core.drawerLinks" {...props} />
      </List>
    </Drawer>
  );
};

RawAppDrawer.defaultProps = {
  drawerLinks: null,
};

RawAppDrawer.propTypes = {
  drawerLinks: PropTypes.any,
};

export default withNamespaces()(RawAppDrawer);
