import React, { useEffect } from "react";
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
import { useDispatch } from "react-redux";

import PluginRegistry from "../core/PluginRegistry";

import OuSearch from "../shared/OuSearch";
import PeriodPicker from "../shared/PeriodPicker";
import {
  errorSnackBar,
  succesfullSnackBar,
} from "../shared/snackBars/snackBar";

import ContractFieldSelect from "./ContractFieldSelect";
import {
  getNonStandartContractFields,
  getStartDateFromPeriod,
  getEndDateFromPeriod,
  getQuarterFromDate,
  getStartMonthFromQuarter,
  getEndMonthFromQuarter,
} from "./utils";

import { enqueueSnackbar } from "../redux/actions/snackBars";

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

const ContractsDialog = ({
  t,
  contract,
  contractFields,
  onSavedSuccessfull,
  children,
}) => {
  const [open, setOpen] = React.useState(false);

  const contractService = PluginRegistry.extension("contracts.service");
  const [currentContract, setCurrentContract] = React.useState(contract);
  const [isLoading, setIsLoading] = React.useState(false);
  const classes = useStyles();
  const dispatch = useDispatch();

  useEffect(() => {
    setCurrentContract(contract);
  }, [contract]);

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
    setIsLoading(true);
    const saveContract =
      currentContract.id !== 0
        ? contractService.updateContract(currentContract)
        : contractService.createContract(
            [currentContract.fieldValues.orgUnit.id],
            currentContract,
          );
    saveContract
      .then(() => {
        setIsLoading(false);
        onSavedSuccessfull();
        dispatch(enqueueSnackbar(succesfullSnackBar("snackBar.success.save")));
      })
      .catch((err) => {
        setIsLoading(false);
        dispatch(
          enqueueSnackbar(errorSnackBar("snackBar.error.save", null, err)),
        );
      });
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    const props = { onClick: () => handleClickOpen() };
    if (React.isValidElement(child)) {
      return React.cloneElement(child, props);
    }
    return child;
  });
  return (
    <>
      {!children && (
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
      )}
      {Boolean(children) && childrenWithProps}
      <Dialog onClose={handleClose} open={open} fullWidth maxWidth="sm">
        <DialogTitle disableTypography>
          <Typography variant="h6" className={classes.title}>
            {currentContract.id !== 0 && t("contracts.editTitle")}
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
                onChange={(orgUnit) =>
                  handleChange("fieldValues", orgUnit, "orgUnit")
                }
                orgUnit={currentContract.fieldValues.orgUnit}
              />
            </Grid>
            <Grid container item xs={6}>
              <PeriodPicker
                periodDelta={{ before: 20, after: 20 }}
                period={getQuarterFromDate(
                  currentContract.fieldValues.contract_start_date,
                )}
                max={getQuarterFromDate(
                  currentContract.fieldValues.contract_end_date,
                )}
                renderPeriod={(p) =>
                  `${getStartMonthFromQuarter(p)} ${p.substring(0, 4)}`
                }
                labelKey="start_period"
                onPeriodChange={(startPeriod) =>
                  handleChange(
                    "fieldValues",
                    getStartDateFromPeriod(startPeriod),
                    "contract_start_date",
                  )
                }
              />
            </Grid>
            <Grid container item xs={6}>
              <PeriodPicker
                periodDelta={{ before: 20, after: 20 }}
                period={getQuarterFromDate(
                  currentContract.fieldValues.contract_end_date,
                )}
                renderPeriod={(p) =>
                  `${getEndMonthFromQuarter(p)} ${p.substring(0, 4)}`
                }
                labelKey="end_period"
                min={getQuarterFromDate(
                  currentContract.fieldValues.contract_start_date,
                )}
                onPeriodChange={(endPeriod) =>
                  handleChange(
                    "fieldValues",
                    getEndDateFromPeriod(endPeriod),
                    "contract_end_date",
                  )
                }
              />
            </Grid>
            {getNonStandartContractFields(contractFields).map((field) => (
              <Grid container item xs={6} key={field.id}>
                <ContractFieldSelect
                  contract={currentContract}
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
          <Button
            autoFocus
            onClick={handleSave}
            color="primary"
            disabled={isLoading || !currentContract.fieldValues.orgUnit}
          >
            {t("save")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ContractsDialog.defaultProps = {
  onSavedSuccessfull: () => null,
};

ContractsDialog.propTypes = {
  t: PropTypes.func.isRequired,
  contract: PropTypes.object.isRequired,
  contractFields: PropTypes.array.isRequired,
  onSavedSuccessfull: PropTypes.func,
  children: PropTypes.any,
};

export default withNamespaces()(ContractsDialog);
