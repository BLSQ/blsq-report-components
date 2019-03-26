import React, { Component } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import FormControl from "@material-ui/core/FormControl";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import CircularProgress from "@material-ui/core/CircularProgress";

import { Formik, Form, Field } from "formik";
import { Select } from "formik-material-ui";

class OrgUnitsGroupsForm extends Component {
  constructor(props) {
    super(props);
  }

  render() {
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
              groupsets: this.props.groupsetInitVals
            }}
            validate={values => {
              let errors = {};

              return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {
              console.log(values);
              Object.entries(values.groupsets).forEach(([groupset, groups]) => {
                groups.forEach(async group => {
                  let targetGroup = this.props.organisationUnitGroups.filter(
                    target => target.id === group
                  )[0];

                  await this.props.dhis2.addToGroup(
                    values.orgUnitId,
                    targetGroup
                  );
                });
              });
              this.props.searchOrgunit();
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
                </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Describe what to do with this dialog...
                  </DialogContentText>
                  {this.props.organisationUnitGroupSets.map(
                    (groupset, index) => (
                      <React.Fragment key={"grset-" + groupset.id}>
                        <Grid container spacing={24}>
                          <Grid item xs={3}>
                            <Typography variant="subheading">
                              {groupset.name}
                            </Typography>
                          </Grid>
                          <Grid item xs={9}>
                            <FormControl margin="normal" required fullWidth>
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
                                {groupset.organisationUnitGroups.map(group => (
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
                  other groups...
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={this.props.handleDialogFormClose}
                    color="primary"
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onClick={submitForm}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving... " : "Save"}
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

export default OrgUnitsGroupsForm;
