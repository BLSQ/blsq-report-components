import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces } from "react-i18next";
import Paper from "@material-ui/core/Paper";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { Formik, Form } from "formik";

import OuSelectionContainer from "./OuSelectionContainer";
import OrgUnitsGroupsForm from "./OrgUnitsGroupsForm";

const styles = theme => ({
  paper: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
    padding: theme.spacing.unit * 2,
    [theme.breakpoints.up(600 + theme.spacing.unit * 3 * 2)]: {
      marginTop: theme.spacing.unit * 6,
      marginBottom: theme.spacing.unit * 6,
      padding: theme.spacing.unit * 3
    }
  },
  stepper: {
    marginLeft: "auto",
    marginRight: "auto",
    width: 600,
    padding: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit * 1}px`
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end"
  },
  button: {
    marginTop: theme.spacing.unit * 3,
    marginLeft: theme.spacing.unit
  }
});

function getOuFormStep(
  step,
  props,
  values,
  organisationUnitGroupSets,
  isSubmitting,
  setFieldValue,
  nextStepFn
) {
  switch (step) {
    case 0:
      return (
        <OuSelectionContainer
          organisationUnitGroupSets={organisationUnitGroupSets}
          isSubmitting={isSubmitting}
          setFieldValue={setFieldValue}
          values={values}
          nextStepFn={nextStepFn}
          key="OuSelectionContainer"
          {...props}
        />
      );
    case 1:
      return (
        <OrgUnitsGroupsForm
          organisationUnitGroupSets={organisationUnitGroupSets}
          isSubmitting={isSubmitting}
          setFieldValue={setFieldValue}
          values={values}
          {...props}
        />
      );

    default:
      throw new Error("Unknown step");
  }
}

class MainContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeStep: 0,
      organisationUnitGroupSets: undefined,
      groupsetInitVals: undefined
    };
    this.loadData = this.loadData.bind(this);
  }

  handleNext = () => {
    this.setState(state => ({
      activeStep: state.activeStep + 1
    }));
  };

  handleBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1
    }));
  };

  handleReset = () => {
    this.setState({
      activeStep: 0
    });
  };

  async loadData() {
    const organisationUnitGroupSetsResponse = await this.props.dhis2.organisationUnitGroupSets();
    let organisationUnitGroupSets =
      organisationUnitGroupSetsResponse.organisationUnitGroupSets;

    let groupsetInitVals = {};

    organisationUnitGroupSets.forEach(groupset => {
      groupsetInitVals[`${groupset.id}`] = [];
    });

    this.setState({
      organisationUnitGroupSets: organisationUnitGroupSets,
      groupsetInitVals: groupsetInitVals
    });
  }
  async componentDidMount() {
    this.loadData();
  }

  render() {
    const { classes, t } = this.props;
    const { activeStep } = this.state;
    const steps = [t("select_org_unit"), t("edit_org_unit_groups")];

    if (this.state.organisationUnitGroupSets === undefined) {
      return "Show loader";
    }
    // debugger;
    return (
      <React.Fragment>
        <Paper key="main-paper" className={classes.paper}>
          <Stepper activeStep={activeStep} className={classes.stepper}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <React.Fragment>
            {activeStep === steps.length ? (
              this.handleReset()
            ) : (
              <React.Fragment>
                <Formik
                  initialValues={{
                    orgUnitId: "",
                    orgUnitGroups: [],
                    groupsets: this.state.groupsetInitVals
                  }}
                  validate={values => {
                    let errors = {};
                  }}
                  onSubmit={async (values, { setSubmitting }) => {
                    Object.entries(values.groupsets).forEach(
                      ([groupset, groups]) => {
                        groups.forEach(group => {
                          this.props.dhis2.addToGroup(values.orgUnitId, group);
                        });
                      }
                    );

                    setSubmitting(false);
                    this.handleNext();
                  }}
                  render={({
                    values,
                    isSubmitting,
                    submitForm,
                    handleSubmit,
                    setFieldValue
                  }) => (
                    <Form>
                      <div className={classes.buttons}>
                        {activeStep !== 0 && (
                          <Button
                            onClick={this.handleBack}
                            className={classes.button}
                            disabled={isSubmitting}
                          >
                            {t("select_org_unit")}
                          </Button>
                        )}

                        {activeStep > 0 && (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={
                              activeStep === steps.length - 1
                                ? submitForm
                                : this.handleNext
                            }
                            className={classes.button}
                            disabled={isSubmitting}
                          >
                            {activeStep === steps.length - 1
                              ? isSubmitting
                                ? t("saving_org_unit_groups")
                                : t("save_org_unit_groups")
                              : t("edit_org_unit_groups")}
                          </Button>
                        )}
                      </div>
                      {getOuFormStep(
                        activeStep,
                        this.props,
                        values,
                        this.state.organisationUnitGroupSets,
                        isSubmitting,
                        setFieldValue,
                        this.handleNext
                      )}
                    </Form>
                  )}
                />
              </React.Fragment>
            )}
          </React.Fragment>
        </Paper>
      </React.Fragment>
    );
  }
}

MainContainer.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(withNamespaces()(MainContainer));
