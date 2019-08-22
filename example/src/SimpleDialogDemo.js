import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import PersonIcon from "@material-ui/icons/Person";
import AddIcon from "@material-ui/icons/Add";

const emails = ["Jake & Jones", "Mell Rose Place"];

const classes = {};

function SimpleDialog(props) {
  const { onClose, selectedValue, ...other } = props;

  function handleClose() {
    onClose(selectedValue);
  }

  function handleListItemClick(value) {
    onClose(value);
  }

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      {...other}
    >
      <DialogTitle id="simple-dialog-title">
        Validate and next step is for user :
      </DialogTitle>
      <List>
        {emails.map(email => (
          <ListItem
            button
            onClick={() => handleListItemClick(email)}
            key={email}
          >
            <ListItemAvatar>
              <Avatar className={classes.avatar}>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={email} />
          </ListItem>
        ))}

        <ListItem button onClick={() => handleListItemClick("addAccount")}>
          <ListItemAvatar>
            <Avatar>
              <AddIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="add account" />
        </ListItem>
      </List>
    </Dialog>
  );
}

SimpleDialog.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  selectedValue: PropTypes.string
};



export default function SimpleDialogDemo(props) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(emails[1]);

  const validating =  (dataElementId, props) => {
    var dhis2 = props.dhis2;
    var dataElement = {de: dataElementId, pe: props.params.invoice.period, value: true, ou: props.params.invoice.orgUnit.id, co: "HllvX50cXC0", ds: props.data.dataSet};
    var validate = dhis2.setDataValue(dataElement);
    window.location.reload();
    return validate;
};

  function handleClickOpen() {
    setOpen(true);
  }

  const handleClose = value => {
    setOpen(false);
    setSelectedValue(value);
  };

  return (
    <span>
      {props.params.invoice.currentUser.userGroups.some(g => g.id === "wl5cDMuUhmF") && (<Button color="primary" onClick={() => {if (window.confirm('Are you sure to validate the invoice?')) validating(props.data.dataElement[1], props) }} >
       First Validation
      </Button>)}

      {props.params.invoice.currentUser.userGroups.some(g => g.id === "wl5cDMuUhmF") && (<Button color="primary" onClick={handleClickOpen} title={selectedValue}>
       Second Validation
      </Button>)}

      <SimpleDialog
        selectedValue={selectedValue}
        open={open}
        onClose={handleClose}
      />
    </span>
  );
}
