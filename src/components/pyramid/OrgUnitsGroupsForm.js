import React, { Component } from "react";
import PropTypes from "prop-types";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import Radio from "@material-ui/core/Radio";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import CircularProgress from "@material-ui/core/CircularProgress";
import Error from "@material-ui/icons/Error";

import { Formik, Form, Field } from "formik";
import { Select, RadioGroup } from "formik-material-ui";

class OrgUnitsGroupsForm extends Component {
  constructor(props) {
    super(props);
  }

  async setContractSettings(values) {
    // console.log(values);

    if (values.contractSettings.primaryOu !== "") {
      // 1. remove the old primaryOu from this.props.contractSettings.primaryFlagGroup group
      values.contractSettings.oldPrimaryOu !== undefined &&
        (await this.props.dhis2.removeFromGroup(
          values.contractSettings.oldPrimaryOu,
          this.props.contractSettings.primaryFlagGroup
        ));

      // 2. add primaryOu to this.props.contractSettings.primaryFlagGroup group

      let targetPrimaryFlagGroup = this.getTargetGroup(
        this.props.contractSettings.primaryFlagGroup
      );

      targetPrimaryFlagGroup !== undefined &&
        (await this.props.dhis2.addToGroup(
          values.contractSettings.primaryOu,
          targetPrimaryFlagGroup
        ));

      // 3. rename values.groupsets[this.props.contractSettings.contractSubContractGroupSet][0] group to primaryOu name
      let targetContractSubContractGroup = this.getTargetGroup(
        values.groupsets[
          this.props.contractSettings.contractSubContractGroupSet
        ].filter(Boolean)[0]
      );

      if (targetContractSubContractGroup === undefined) {
        await this.props.dhis2.createContractGroup(
          this.props.selectedOrgUnit,
          this.props.contractSettings.contractSubContractGroupSet,
          "Contract - "
        );

        // add this.props.selectedOrgUnit to this.props.contractSettings.primaryFlagGroup (targetPrimaryFlagGroup)

        targetPrimaryFlagGroup !== undefined &&
          (await this.props.dhis2.addToGroup(
            this.props.selectedOrgUnit.id,
            targetPrimaryFlagGroup
          ));
      } else if (targetContractSubContractGroup !== undefined) {
        let primaryOuInfo = targetContractSubContractGroup.organisationUnits.find(
          ou => ou.id === values.contractSettings.primaryOu
        );
        await this.props.dhis2.renameGroup(
          targetContractSubContractGroup,
          "Contract - " + primaryOuInfo.name
        );
      }
    }
  }

  async setOrgUnitGroups(values) {
    let oldGroups = this.props.selectedOrgUnit.organisationUnitGroups.map(
      group => group.id
    );
    let newGroups = Object.values(values.groupsets).flat();
    let fakeGroup = newGroups.indexOf("00000000000");
    fakeGroup > -1 && newGroups.splice(fakeGroup, 1);

    let deletableDiffs = oldGroups
      .filter(oldGroup => !newGroups.includes(oldGroup))
      .filter(
        deletableDiff =>
          deletableDiff !== this.props.contractSettings.primaryFlagGroup
      );

    deletableDiffs.length > 0 &&
      (await this.props.dhis2.removeFromGroup(
        values.orgUnitId,
        deletableDiffs
      ));

    Object.entries(values.groupsets).forEach(([groupset, groups]) => {
      groups.forEach(async group => {
        let targetGroup = this.getTargetGroup(group);

        targetGroup !== undefined &&
          (await this.props.dhis2.addToGroup(values.orgUnitId, targetGroup));
      });
    });
  }

  getTargetGroup(group) {
    return this.props.organisationUnitGroups.find(
      target => target.id === group
    );
  }

  getCurrentPrimaryOu() {
    let targetGroup = this.getTargetGroup(
      this.props.contractSettings.primaryFlagGroup
    );
    let primaryGroupOus = targetGroup.organisationUnits.map(ou => ou.id);

    let contractSubContractGroupOus = this.getTargetGroup(
      this.props.groupsetInitVals[
        this.props.contractSettings.contractSubContractGroupSet
      ][0]
    );

    return contractSubContractGroupOus !== undefined
      ? primaryGroupOus.find(primaryGroupOu =>
          contractSubContractGroupOus.organisationUnits
            .map(ou => ou.id)
            .includes(primaryGroupOu)
        )
      : undefined;
  }

  render() {
    const { classes, contractSettings, t } = this.props;
    const rbfGroupSets =
      contractSettings !== undefined
        ? [
            contractSettings.primaryFlagGroupSet,
            contractSettings.contractSubContractGroupSet
          ]
        : [];
    const contractSubContract = this.props.organisationUnitGroupSets.find(
      groupset => groupset.id === contractSettings.contractSubContractGroupSet
    );

    const primaryOu = this.getCurrentPrimaryOu();

    return (
      <Dialog
        fullWidth
        maxWidth="lg"
        open={this.props.open}
        onClose={this.props.closeHandler}
        scroll="paper"
        aria-labelledby="form-dialog-title"
      >
        {this.props.selectedOrgUnit === undefined ? (
          <CircularProgress />
        ) : (
          <Formik
            initialValues={{
              orgUnitId: this.props.selectedOrgUnit.id,
              groupsets: this.props.groupsetInitVals,
              contractSettings: {
                primaryFlagGroupSet: contractSettings.primaryFlagGroupSet,
                primaryFlagGroup: contractSettings.primaryFlagGroup,
                primaryOu: primaryOu,
                oldPrimaryOu: primaryOu
              }
            }}
            validate={values => {
              let errors = {};

              return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {
              let contractSubContractGroupId =
                values.groupsets[
                  this.props.contractSettings.contractSubContractGroupSet
                ][0];

              if (contractSubContractGroupId === undefined) {
                values.contractSettings.primaryOu = "";
              } else {
                let contractSubContractGroup = this.getTargetGroup(
                  contractSubContractGroupId
                );

                values.contractSettings.primaryOu =
                  contractSubContractGroup === undefined
                    ? this.props.selectedOrgUnit.id
                    : values.contractSettings.primaryOu;
              }

              this.setOrgUnitGroups(values);
              //this.setContractSettings(values);
              // // Should wait until promise(s) resolved before reloading Groups
              //this.props.reloadGroupsFn();
              //this.props.searchOrgunitFn();
              // setSubmitting(false);
              // this.props.handleDialogFormClose();
            }}
            render={({
              values,
              isSubmitting,
              submitForm,
              handleSubmit,
              setFieldValue,
              errors
            }) => (
              <Form>
                <DialogTitle id="form-dialog-title">
                  {this.props.selectedOrgUnit.name}
                  <Typography variant="caption" gutterBottom>
                    {this.props.selectedOrgUnit.ancestors
                      .map(a => a.name)
                      .join(" > ")}
                  </Typography>
                </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Describe what to do with this dialog...
                  </DialogContentText>
                  <Divider />
                  {this.props.organisationUnitGroupSets.map(
                    (groupset, index) =>
                      !rbfGroupSets.includes(groupset.id) && (
                        <React.Fragment key={"grset-" + groupset.id}>
                          <Grid container spacing={24}>
                            <Grid item xs={3}>
                              <Typography variant="subheading" gutterBottom>
                                {groupset.name}
                              </Typography>
                              {values.groupsets[groupset.id].length > 1 && (
                                <Typography
                                  className={classes.error}
                                  variant="caption"
                                  gutterBottom
                                >
                                  <Error />{" "}
                                  {t("error_belong_to_multiple_groups")}
                                </Typography>
                              )}
                            </Grid>
                            <Grid item xs={9}>
                              <FormControl margin="normal" fullWidth>
                                <Field
                                  name={"groupsets." + groupset.id}
                                  component={Select}
                                  value={values.groupsets[groupset.id]}
                                  multiple={true}
                                  inputProps={{
                                    name: "groupsets." + groupset.id,
                                    id: "groupsets." + groupset.id
                                  }}
                                >
                                  {groupset.organisationUnitGroups
                                    .sort((a, b) => {
                                      if (a.name < b.name) return -1;
                                      if (a.name > b.name) return 1;
                                      return 0;
                                    })
                                    .map(group => (
                                      <MenuItem
                                        key={"group-" + groupset.id + group.id}
                                        value={group.id}
                                      >
                                        {group.name}
                                      </MenuItem>
                                    ))}
                                </Field>
                              </FormControl>
                            </Grid>
                          </Grid>
                          {this.props.organisationUnitGroupSets.length !==
                            index + 1 && <Divider light />}
                        </React.Fragment>
                      )
                  )}

                  {this.props.otherOrgUnitGroups.length > 0 && (
                    <React.Fragment key={"grset-other-groups"}>
                      <Divider light />
                      <Grid container spacing={24}>
                        <Grid item xs={3}>
                          <Typography variant="subheading" gutterBottom>
                            {t("other_groups")}
                          </Typography>
                          {values.groupsets["othergroups"].length > 1 && (
                            <Typography
                              className={classes.error}
                              variant="caption"
                              gutterBottom
                            >
                              <Error />{" "}
                              {t("error_belong_to_multiple_other_groups")}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item xs={9}>
                          <FormControl margin="normal" fullWidth>
                            <Field
                              name={"groupsets.othergroups"}
                              component={Select}
                              value={values.groupsets["othergroups"]}
                              multiple={true}
                              inputProps={{
                                name: "groupsets.othergroups",
                                id: "groupsets.othergroups"
                              }}
                            >
                              {this.props.otherOrgUnitGroups
                                .sort((a, b) => {
                                  if (a.name < b.name) return -1;
                                  if (a.name > b.name) return 1;
                                  return 0;
                                })
                                .map(group => (
                                  <MenuItem
                                    key={"group-othergroups" + group.id}
                                    value={group.id}
                                  >
                                    {group.name}
                                  </MenuItem>
                                ))}
                            </Field>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </React.Fragment>
                  )}
                  {rbfGroupSets.length > 0 && (
                    <React.Fragment>
                      <br />
                      <br />
                      <DialogContentText>
                        {t("rbf_specific_org_unit_groups")}
                      </DialogContentText>
                      <Divider />
                      <Grid container spacing={24}>
                        <Grid item xs={3}>
                          <Typography variant="subheading" gutterBottom>
                            {contractSubContract.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <FormControl margin="normal" fullWidth>
                            <Field
                              name={
                                "groupsets." + contractSubContract.id + ".0"
                              }
                              component={Select}
                              value={[values.groupsets[contractSubContract.id]]}
                              inputProps={{
                                required: false,
                                name:
                                  "groupsets." + contractSubContract.id + ".0",
                                id: "groupsets." + contractSubContract.id
                              }}
                            >
                              <MenuItem
                                key={
                                  "group-" + contractSubContract.id + "-empty"
                                }
                                value={undefined}
                              >
                                {t("no_contract_sub_contract_group")}
                              </MenuItem>
                              {contractSubContract.organisationUnitGroups
                                .sort((a, b) => {
                                  if (a.name < b.name) return -1;
                                  if (a.name > b.name) return 1;
                                  return 0;
                                })
                                .map(group => (
                                  <MenuItem
                                    key={
                                      "group-" +
                                      contractSubContract.id +
                                      group.id
                                    }
                                    value={group.id}
                                  >
                                    {group.name}
                                  </MenuItem>
                                ))}
                              {this.props.selectedOrgUnit.id !==
                                values.contractSettings.primaryOu && (
                                <MenuItem
                                  key={"group-" + contractSubContract.id + "0"}
                                  value="00000000000"
                                >
                                  {t("create_new_from") +
                                    " " +
                                    this.props.selectedOrgUnit.name}
                                </MenuItem>
                              )}
                            </Field>
                          </FormControl>
                        </Grid>
                        <Grid item xs={5}>
                          <Typography variant="caption" gutterBottom>
                            {t("choose_primary_org_unit")}
                          </Typography>
                          {values.groupsets[contractSubContract.id].length >
                            0 &&
                            values.groupsets[contractSubContract.id][0] !==
                              undefined &&
                            values.groupsets[contractSubContract.id][0] !==
                              "00000000000" && (
                              <Field
                                name={"contractSettings.primaryOu"}
                                component={RadioGroup}
                              >
                                {this.props.organisationUnitGroups
                                  .find(
                                    group =>
                                      group.id ===
                                      (Array.isArray(
                                        values.groupsets[contractSubContract.id]
                                      )
                                        ? values.groupsets[
                                            contractSubContract.id
                                          ][0]
                                        : values.groupsets[
                                            contractSubContract.id
                                          ])
                                  )
                                  .organisationUnits.map(organisationUnit => (
                                    <FormControlLabel
                                      key={"orgUnit-" + organisationUnit.id}
                                      value={organisationUnit.id}
                                      control={
                                        <Radio disabled={isSubmitting} />
                                      }
                                      label={organisationUnit.name}
                                      disabled={isSubmitting}
                                    />
                                  ))}
                              </Field>
                            )}
                        </Grid>
                      </Grid>
                    </React.Fragment>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={this.props.handleDialogFormClose}
                    color="primary"
                  >
                    {t("cancel_edit_org_unit_groups")}
                  </Button>
                  <Button
                    color="primary"
                    onClick={submitForm}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? t("saving_org_unit_groups")
                      : t("save_org_unit_groups")}
                  </Button>
                </DialogActions>
              </Form>
            )}
          />
        )}
      </Dialog>
    );
  }
}
OrgUnitsGroupsForm.propTypes = {
  classes: PropTypes.object.isRequired
};
export default OrgUnitsGroupsForm;
