import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import Button from "@material-ui/core/Button";

const styles = {
  root: {
    display: "block",
    flex: 1
  },
  formControl: {
    minWidth: 500,
    maxWidth: 500,
    margin: 10,
    alignText: "right"
  },
  button: {
    margin: 10
  }
};

class OrganisationUnitsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.dhis2 = this.props.dhis2;
    this.loadData = this.loadData.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.applyChanges = this.applyChanges.bind(this);
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
        currentGroupIds: [
          ...new Set([...this.state.currentGroupIds, ...valueBis])
        ]
      });
    }
  }

  async applyChanges() {
    const ouGroupIds = this.state.orgUnit.organisationUnitGroups.map(
      oug => oug.id
    );
    const toRemove = ouGroupIds.filter(
      n => !this.state.currentGroupIds.includes(n)
    );
    const toAdd = this.state.currentGroupIds.filter(
      n => !ouGroupIds.includes(n)
    );
    debugger;
    let promises = toRemove.map(toBeRemoved =>
      this.dhis2.removeFromGroup(this.state.orgUnit.id, toBeRemoved)
    );
    promises = promises.concat(
      toAdd.map(toBeAdded =>
        this.dhis2.addToGroup(this.state.orgUnit.id, toBeAdded)
      )
    );
    await Promise.all(promises);
    this.loadData();
  }

  render() {
    const { classes } = this.props;
    if (this.state == null) {
      return <div />;
    }

    const { orgUnit, organisationUnitGroupSets, currentGroupIds } = this.state;

    return (
      <form autoComplete="off" className={classes.root}>
        <h1>
          {orgUnit.ancestors.map(ou => ou.name).join(" > ")} :{" "}
          {orgUnit && orgUnit.name}
        </h1>
        {organisationUnitGroupSets &&
          organisationUnitGroupSets.map(groupset => (
            <div>
              <FormControl variant="filled" className={classes.formControl}>
                <InputLabel htmlFor="select-multiple">
                  {groupset.name}
                </InputLabel>
                <Select
                  displayEmpty={true}
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
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={this.applyChanges}
        >
          Apply changes
        </Button>
      </form>
    );
  }
}

export default withStyles(styles)(OrganisationUnitsContainer);
