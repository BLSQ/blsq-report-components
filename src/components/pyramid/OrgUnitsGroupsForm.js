import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import Radio from "@material-ui/core/Radio";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import Loader from "./Loader";

import { Field } from "formik";
import { Select, RadioGroup } from "formik-material-ui";

class OrgUnitsGroupsForm extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedOrganisationUnit: undefined };
    this.dhis2 = this.props.dhis2;
    this.loadData();
  }
  async loadData() {
    let selectedOrganisationUnit = await this.dhis2.getOrgunit(
      this.props.values.orgUnitId
    );

    this.setState({
      selectedOrganisationUnit: selectedOrganisationUnit
    });
  }

  render() {
    if (this.state.selectedOrganisationUnit === undefined) {
      return "Show loader";
    }
    const { isSubmitting, organisationUnitGroupSets, t } = this.props;

    return (
      <React.Fragment>
        <Typography variant="title" component="h5" gutterBottom>
          {"Show ancestors... > " + this.state.selectedOrganisationUnit.name}
        </Typography>
        <br />
        <br />
        <Grid container spacing={24}>
          <Grid item xs={3}>
            <Typography variant="caption" gutterBottom align="center">
              {t("org_unit_group_set")}
            </Typography>
          </Grid>
          <Grid item xs={9}>
            <Typography variant="caption" gutterBottom align="center">
              {t("org_unit_groups")}
            </Typography>
          </Grid>
        </Grid>
        <Divider />
        {organisationUnitGroupSets.map((groupset, index) => (
          <React.Fragment key={"grset-" + groupset.id}>
            <Grid container spacing={24}>
              <Grid item xs={3}>
                <Typography variant="subheading">{groupset.name}</Typography>
              </Grid>
              <Grid item xs={9}>
                <FormControl margin="normal" required fullWidth>
                  <Field
                    name={"groupsets." + groupset.id}
                    component={Select}
                    value={this.props.values.groupsets[groupset.id]}
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
            {organisationUnitGroupSets.length !== index + 1 && (
              <Divider light />
            )}
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  }
}

export default OrgUnitsGroupsForm;
