import React from "react";
import PropTypes from "prop-types";
import { withNamespaces } from "react-i18next";
import {
  Button,
  Dialog,
  Tooltip,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  makeStyles,
  Grid,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import Edit from "@material-ui/icons/Edit";

import DatePeriods from "../../support/DatePeriods";
import OuSearch from "../shared/OuSearch";
import PeriodPicker from "../shared/PeriodPicker";
import ContractFieldSelect from "./ContractFieldSelect";
import { getNonStandartContractFields } from "./utils";

const styles = (theme) => ({
  title: {
    width: "80%",
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  label: {
    paddingTop: 4,
  },
});

const useStyles = makeStyles((theme) => styles(theme));

const ContractsDialog = ({ t, contract, contractFields }) => {
  const [open, setOpen] = React.useState(false);
  const [currentContract, setCurrentContract] = React.useState(contract);
  const classes = useStyles();
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleChange = (key, value, subKey) => {
    setCurrentContract({
      ...currentContract,
      [key]: !subKey
        ? value
        : {
            ...currentContract[key],
            [subKey]: value,
          },
    });
  };
  const handleSave = () => {
    console.log("Save:", currentContract);
  };
  return (
    <div>
      <Tooltip
        onClick={() => handleClickOpen()}
        placement="bottom"
        title={t("edit")}
        arrow
      >
        <span>
          <IconButton size="small">
            <Edit />
          </IconButton>
        </span>
      </Tooltip>
      <Dialog onClose={handleClose} open={open} fullWidth maxWidth="sm">
        <DialogTitle disableTypography>
          <Typography variant="h6" className={classes.title}>
            {currentContract.id !== 0 && (
              <>
                {t("contracts.editTitle")}
                <code>{` ${currentContract.id}`}</code>
              </>
            )}
            {currentContract.id === 0 && t("contracts.createTitle")}
          </Typography>
          <IconButton className={classes.closeButton} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid container item xs={12}>
              <OuSearch
                onChange={(orgUnit) => handleChange("orgUnit", orgUnit)}
                orgUnit={currentContract.orgUnit}
              />
            </Grid>
            <Grid container item xs={6}>
              <PeriodPicker
                periodDelta={{ before: 20, after: 20 }}
                period={
                  DatePeriods.split(currentContract.startPeriod, "quarterly")[0]
                }
                labelKey="start_period"
                onPeriodChange={(startPeriod) =>
                  handleChange("startPeriod", startPeriod)
                }
              />
            </Grid>
            <Grid container item xs={6}>
              <PeriodPicker
                periodDelta={{ before: 20, after: 20 }}
                period={
                  DatePeriods.split(currentContract.endPeriod, "quarterly")[0]
                }
                labelKey="end_period"
                onPeriodChange={(endPeriod) =>
                  handleChange("endPeriod", endPeriod)
                }
              />
            </Grid>
            {getNonStandartContractFields(contractFields).map((field) => (
              <Grid container item xs={6} key={field.id}>
                <ContractFieldSelect
                  contract={contract}
                  field={field}
                  handleChange={(newValue) =>
                    handleChange("fieldValues", newValue, field.code)
                  }
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleSave} color="primary">
            {t("save")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
ContractsDialog.defaultProps = {
  contract: {
    id: 0,
    orgUnit: null,
    codes: [],
    fieldValues: {},
  },
};

ContractsDialog.propTypes = {
  t: PropTypes.func.isRequired,
  contract: PropTypes.object,
  contractFields: PropTypes.array.isRequired,
};

export default withNamespaces()(ContractsDialog);
