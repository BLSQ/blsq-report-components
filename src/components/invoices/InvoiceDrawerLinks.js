import React from "react";
import FileIcon from "@material-ui/icons/InsertDriveFile";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { withNamespaces } from "react-i18next";

const drawerLink = (props) => (
  <ListItem button component="a" href={"./index.html#" + props.defaultPathName}>
    <ListItemIcon>
      <FileIcon />
    </ListItemIcon>
    <ListItemText primary={props.t("report_and_invoices")} />
  </ListItem>
);

export default withNamespaces()(drawerLink);
