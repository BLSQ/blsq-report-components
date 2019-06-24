import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";

const styles = {
  root: {
    display: "block",
    flex: 1
  },
  formControl: {
    minWidth: 400,
    maxWidth: 400
  }
};

class OrganisationUnitsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.dhis2 = this.props.dhis2;
    this.loadData = this.loadData.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  async componentDidMount() {
    this.loadData();
  }
  async loadData() {
    const orgUnit = await this.props.dhis2.organisationUnit(
      this.props.match.params.orgUnitId
    );

    const organisationUnitGroupSetsResponse = await this.dhis2.organisationUnitGroupSets();
    let organisationUnitGroupSets =
      organisationUnitGroupSetsResponse.organisationUnitGroupSets;
    const currentGroupIds = orgUnit.organisationUnitGroups.map(k => k.id);
    this.setState({ orgUnit, organisationUnitGroupSets, currentGroupIds });
  }

  handleChange(event, selectedValueItem) {
    const valueBis = event.target.value;
    const value = selectedValueItem.props.value;
    const contains = this.state.currentGroupIds.includes(value);
    if (contains) {
      const newGroupIds = this.state.currentGroupIds.filter(v => v !== value);

      this.setState({
        currentGroupIds: newGroupIds
      });
    } else {
      this.setState({
        currentGroupIds: [...this.state.currentGroupIds, ...valueBis]
      });
    }
  }

  render() {
    const { classes } = this.props;
    if (this.state == null) {
      return <div />;
    }

    const { orgUnit, organisationUnitGroupSets, currentGroupIds } = this.state;

    return (
      <form autoComplete="off" className={classes.root}>
        <h1>Editing : {orgUnit && orgUnit.name}</h1>
        {organisationUnitGroupSets &&
          organisationUnitGroupSets.map(groupset => (
            <div>
              <FormControl variant="filled" className={classes.formControl}>
                <InputLabel htmlFor="select-multiple">
                  {groupset.name}
                </InputLabel>
                <Select
                  value={currentGroupIds}
                  onChange={this.handleChange}
                  name={groupset.id}
                  multiple
                >
                  {groupset.organisationUnitGroups.map(oug => (
                    <MenuItem
                      checked={currentGroupIds.indexOf(oug.id) >= 0}
                      value={oug.id}
                    >
                      {oug.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          ))}
      </form>
    );
  }
}

export default withStyles(styles)(OrganisationUnitsContainer);
