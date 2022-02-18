import React, { useEffect } from "react";
import { useMutation, useQueryClient } from "react-query";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
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
import AddIcon from "@material-ui/icons/Add";
import { useDispatch } from "react-redux";
import PeriodPicker from "./PeriodPicker";
import PluginRegistry from "../core/PluginRegistry";

import OuSearch from "../shared/OuSearch";
import { errorSnackBar, succesfullSnackBar } from "../shared/snackBars/snackBar";

import ContractFieldSelect from "./ContractFieldSelect";
import { getNonStandartContractFields, getContractByOrgUnit, cloneContractWithoutId } from "./utils/index";

import { getStartDateFromPeriod, getEndDateFromPeriod } from "./utils/periodsUtils";
import { enqueueSnackbar } from "../redux/actions/snackBars";

import LoadingSpinner from "../shared/LoadingSpinner";
import GenerateTablesNeeded from "./GenerateTablesNeeded";

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
  contracts,
  displayOrgUnit,
  displayMainOrgUnit,
}) => {
  const [open, setOpen] = React.useState(false);
  const contractService = PluginRegistry.extension("contracts.service");

  const [currentContract, setCurrentContract] = React.useState(contractService.defaultPeriod(contract));
  const [validationErrors, setValidationErrors] = React.useState([]);
  const classes = useStyles();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    const newCurrentContract = contract.id ? contract : currentContract;
    const errors = contractService.validateContract(newCurrentContract);

    setCurrentContract(newCurrentContract);
    setValidationErrors(errors);
  }, [contract]);

  const handleClickOpen = (previousContractInfo = null, isNewContract) => {
    if (isNewContract || previousContractInfo === undefined || previousContractInfo === null) {
      debugger
      setCurrentContract(cloneContractWithoutId(contract));
    } else {
      debugger
      contract.id = contract.fieldValues.id;
      setCurrentContract(contract);
    }

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleChange = (key, value, subKey) => {
    const updatedContract = {
      ...currentContract,
      [key]: !subKey
        ? value
        : {
            ...currentContract[key],
            [subKey]: value,
          },
    };
    const errors = contractService.validateContract(updatedContract);

    setCurrentContract({
      ...updatedContract,
    });
    setValidationErrors(errors);
  };

  const handleSaveMutation = useMutation(
    async () => {
      console.log(currentContract);
      debugger;
      /* const saveContract =
        currentContract.id !== 0
          ? await contractService.updateContract(currentContract)
          : await contractService.createContract([currentContract.fieldValues.orgUnit.id], currentContract);
      return saveContract;
      */
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("fetchContracts");
        onSavedSuccessfull();
        dispatch(enqueueSnackbar(succesfullSnackBar("snackBar.success.save")));
      },
      onError: (error) => {
        dispatch(enqueueSnackbar(errorSnackBar("snackBar.error.save", null, error)));
      },
    },
  );

  const isLoading = handleSaveMutation.isLoading;

  const childrenWithProps = React.Children.map(children, (child) => {
    const props = { onClick: () => handleClickOpen() };
    if (React.isValidElement(child)) {
      return React.cloneElement(child, props);
    }
    return child;
  });
  let mainOrgUnit;
  if (currentContract.fieldValues.contract_main_orgunit) {
    const mainContract = getContractByOrgUnit(contracts, currentContract.fieldValues.contract_main_orgunit);
    if (mainContract) {
      mainOrgUnit = mainContract.orgUnit;
    }
  }

  return (
    <>
      {!children && (
        <React.Fragment>
          {currentContract.fieldValues.contract_main_orgunit && (
            <Tooltip
              onClick={() => handleClickOpen(currentContract, true)}
              placement="bottom"
              title={t("create")}
              arrow
            >
              <span>              
                <IconButton size="small">
                  <AddIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
          <Tooltip onClick={() => handleClickOpen(currentContract, false)} placement="bottom" title={t("edit")} arrow>
            <span>
              <IconButton size="small">
                <Edit />
              </IconButton>
            </span>
          </Tooltip>
        </React.Fragment>
      )}
      {Boolean(children) && childrenWithProps}
      <Dialog onClose={handleClose} open={open} fullWidth maxWidth="sm">
        {isLoading && <LoadingSpinner />}
        <DialogTitle disableTypography>
          <Typography variant="h6" className={classes.title}>
            {currentContract.id !== 0 && t("contracts.editTitle")}
            {currentContract.id === 0 && t("contracts.createTitle")}
          </Typography>
          <IconButton className={classes.closeButton} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          {validationErrors.length > 0 && (
            <span style={{ color: "red" }}>
              {validationErrors.map((err) => (
                <span>
                  {err.message}
                  <br />
                </span>
              ))}
            </span>
          )}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {(displayOrgUnit || displayMainOrgUnit) && (
              <Grid container item xs={12}>
                {displayOrgUnit && (
                  <OuSearch
                    onChange={(orgUnit) => handleChange("fieldValues", orgUnit, "orgUnit")}
                    orgUnit={currentContract.fieldValues.orgUnit}
                  />
                )}
                <GenerateTablesNeeded orgUnit={currentContract.fieldValues.orgUnit} />
                {displayMainOrgUnit && (
                  <OuSearch
                    onChange={(orgUnit) => handleChange("fieldValues", orgUnit, "contract_main_orgunit")}
                    label={t("contracts.contract_main_orgunit")}
                    orgUnit={mainOrgUnit}
                  />
                )}
              </Grid>
            )}
            <Grid container item xs={6}>
              <span>
                {currentContract && currentContract.startPeriod}
                {currentContract && currentContract.fieldValues && currentContract.fieldValues.contract_start_date}
              </span>
              <PeriodPicker
                contract={currentContract}
                currentPeriod={currentContract.startPeriod}
                max={currentContract.endPeriod}
                mode="beginning"
                fieldName={t("start_period")}
                onPeriodChange={(startPeriod) =>
                  handleChange("fieldValues", getStartDateFromPeriod(startPeriod), "contract_start_date")
                  //TODO synchronise contract.startPeriod
                }
              />
            </Grid>
            <Grid container item xs={6}>
              <span>
                {currentContract && currentContract.endPeriod}
                {currentContract && currentContract.fieldValues && currentContract.fieldValues.contract_end_date}
              </span>

              <PeriodPicker
                contract={currentContract}
                currentPeriod={currentContract.endPeriod}
                min={currentContract.startPeriod}
                fieldName={t("end_period")}
                mode="end"
                onPeriodChange={(endPeriod) =>
                  handleChange("fieldValues", getEndDateFromPeriod(endPeriod), "contract_end_date")
                  //TODO synchronise contract.endPeriod
                }
              />
            </Grid>
            {getNonStandartContractFields(contractFields).map((field) => (
              <Grid container item xs={6} key={field.id}>
                <ContractFieldSelect
                  contract={currentContract}
                  field={field}
                  handleChange={(newValue) => handleChange("fieldValues", newValue, field.code)}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={() => handleSaveMutation.mutate()}
            color="primary"
            disabled={isLoading || (displayOrgUnit && !currentContract.fieldValues.orgUnit)}
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
  contracts: [],
  displayOrgUnit: true,
  displayMainOrgUnit: true,
};

ContractsDialog.propTypes = {
  t: PropTypes.func.isRequired,
  contract: PropTypes.object.isRequired,
  contracts: PropTypes.array,
  contractFields: PropTypes.array.isRequired,
  onSavedSuccessfull: PropTypes.func,
  children: PropTypes.any,
  displayOrgUnit: PropTypes.bool,
  displayMainOrgUnit: PropTypes.bool,
};

export default withTranslation()(ContractsDialog);
