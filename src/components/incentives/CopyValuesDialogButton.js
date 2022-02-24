import React from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";

import DatePeriods from "../../support/DatePeriods";

import FileCopyIcon from "@material-ui/icons/FileCopy";
import { IconButton, Button } from "@material-ui/core";
import TableCell from "@material-ui/core/TableCell";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";

const useStyles = makeStyles({});

const CustomTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: "#266696",
    color: theme.palette.common.white,
    textAlign: "center",
    fontWeight: "bold",
    padding: "5px",
    fontSize: "14px",
  },
  root: {
    textAlign: "left",
    align: "center",
  },
}))(TableCell);

const CopyValuesDialogButton = (props) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [fromPeriod, setFromPeriod] = React.useState(undefined);
  const { fromPeriods, toPeriod, orgUnit, dsi, dhis2, periodFormat } = props;

  const handleClose = () => {
    setOpen(false);
  };

  const handleCopy = async () => {
    setOpen(false);
    const dataSetId = dsi.dataSet.id;
    alert(`Copying '${dsi.dataSet.name}' from ${fromPeriod} to ${toPeriod} for ${orgUnit.name}`);
    const api = await dhis2.api();
    const ou = await api.get("dataValueSets", {
      dataSet: dataSetId,
      period: [fromPeriod],
      orgUnit: orgUnit.id,
      paging: false,
    });
    const targetValues = [];
    for (let dv of ou.dataValues) {
      targetValues.push({ ...dv, period: toPeriod });
    }
    const resp = await api.post("dataValueSets", {
      dataSet: dataSetId,
      dataValues: targetValues,
    });
    window.location.reload(true);
  };

  const handleListItemClick = (value) => {
    setFromPeriod(value);
  };

  const displayPeriod = (period) => {
    return DatePeriods.displayName(period, periodFormat[DatePeriods.detect(period)]);
  };

  return (
    <CustomTableCell style={{ backgroundColor: "lightGrey", color: "white", textAlign: "center" }}>
      <IconButton onClick={() => setOpen(true)}>
        <FileCopyIcon />
      </IconButton>
      <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
        <DialogTitle id="simple-dialog-title">Copy data from period</DialogTitle>
        <List>
          {fromPeriods.map((period) => (
            <ListItem button onClick={() => handleListItemClick(period)} key={period} selected={period === fromPeriod}>
              <ListItemText primary={displayPeriod(period)} />
            </ListItem>
          ))}
        </List>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCopy} color="primary" autoFocus>
            Copy {fromPeriod && <span>&nbsp;from {displayPeriod(fromPeriod)} !</span>}
          </Button>
        </DialogActions>
      </Dialog>
    </CustomTableCell>
  );
};

export default CopyValuesDialogButton;
