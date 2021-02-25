import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import { Link } from "react-router-dom";
import PluginRegistry from "../../core/PluginRegistry";

import _ from "lodash";
import { Paper } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "80%",
    margin: "auto",
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  rootStepContainer: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(4),
    minHeight: "70vh",
  },
}));

const steps = [
  { label: "Select csv", component: Step1 },
  { label: "Review validations", component: Step2 },
  { label: "Confirm Import", component: Step3 },
];

function getSteps() {
  return steps.map((step) => step.label);
}

function getStepContent(stepIndex) {
  return steps[stepIndex].component;
}

function HorizontalLabelPositionBelowStepper({ dhis2 }) {
  const classes = useStyles();
  // wizard active step index
  const [activeStep, setActiveStep] = React.useState(0);
  // indicate if loading
  const [isLoading, setIsLoading] = React.useState(false);
  // csv content with warnings
  const [contractsToImport, setContractsToImport] = React.useState(undefined);
  // selected lines in step 2, to be imported in last step
  const [validatedContracts, setValidatedContracts] = React.useState(undefined);
  // show progress while the import is running
  const [progress, setProgress] = React.useState(undefined);
  const [lastError, setLastError] = React.useState(undefined);
  // prevent double import avoid confirm again
  const [completed, setCompleted] = React.useState(false);
  const steps = getSteps();

  const confirm = async () => {
    setIsLoading(true);
    const contractService = PluginRegistry.extension("contracts.service");
    const contractFields = contractService.contractFields();
    const contracts = validatedContracts
      .filter((contractRaw) => contractRaw.warnings == "")
      .map((contractRaw) => {
        const fieldValues = {
          contract_start_date: contractRaw.contract_start_date,
          contract_end_date: contractRaw.contract_end_date,
          orgUnit: {
            id: contractRaw["orgUnit-id"],
            name: contractRaw["orgUnit-name"],
          },
        };

        contractFields.forEach((field) => (fieldValues[field.code] = contractRaw[field.code]));

        const contract = contractService.newContract(fieldValues);
        return contract;
      });

    const slices = _.chunk(contracts, 50);

    let index = 1;

    for (let slice of slices) {
      try {
        setProgress("Processing page " + index + " of " + slices.length);

        const response = await contractService.createContracts(slice);
        console.log(response);
        index = index + 1;
      } catch (error) {
        setLastError(
          "Error while processing page " +
            index +
            " of " +
            slices.length +
            " " +
            error.message +
            " \n " +
            JSON.stringify(error),
        );
      }
    }
    setProgress("Import done");
    setCompleted(true);
    setIsLoading(false);
  };

  const handleNext = () => {
    if (activeStep == steps.length - 1) {
      confirm();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const StepContent = getStepContent(activeStep);

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        <Paper className={classes.rootStepContainer}>
          <StepContent
            setContractsToImport={setContractsToImport}
            contractsToImport={contractsToImport}
            setValidatedContracts={setValidatedContracts}
            validatedContracts={validatedContracts}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            dhis2={dhis2}
            progress={progress}
          />
          <div>
            {lastError && (
              <div>
                Error : <span style={{ color: "red" }}>{lastError}</span>
              </div>
            )}
            <br />
            <Button variant="contained" color="primary" onClick={handleNext} disabled={isLoading || completed}>
              {activeStep === steps.length - 1 ? "Confirm" : "Next"}
            </Button>

            {completed && (
              <div>
                <Link to="/contracts/">
                  <Button>Check the imported contracts</Button>
                </Link>
              </div>
            )}
          </div>
        </Paper>
      </div>
    </div>
  );
}

export default HorizontalLabelPositionBelowStepper;
