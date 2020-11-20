import React, { Component } from "react";
import OrganisationUnitList from "./OrganisationUnitList";
import Loader from "./Loader";
import TextField from "@material-ui/core/TextField";

class OrganisationUnitsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.dhis2 = this.props.dhis2;
    this.loadData = this.loadData.bind(this);
    this.openForEdition = this.openForEdition.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
  }

  openForEdition(ou) {
    this.props.history.push({
      pathname: "/pyramid/" + ou.id,
    });
  }

  async loadData() {
    const filter = this.props.filter;

    const organisationUnitsResponse = await this.dhis2.organisationUnits(
      this.props.fields,
      filter ? "&filter=" + filter : undefined
    );

    let organisationUnits = organisationUnitsResponse.organisationUnits;

    const organisationUnitGroupSetsResponse = await this.dhis2.organisationUnitGroupSets();
    let organisationUnitGroupSets =
      organisationUnitGroupSetsResponse.organisationUnitGroupSets;

    this.setState({ organisationUnits, organisationUnitGroupSets });
  }
  async componentDidMount() {
    this.loadData();
  }

  handleFilterChange(event) {
    const val = event.target.value;
    this.setState({filter: "name:ilike:"+val})
    this.props.history.replace({
      search: "?filter=" + val,
    });
  }
  render() {
    const { organisationUnits, organisationUnitGroupSets, filter } = this.state;
    return (
      <React.Fragment>
        <h1>Pyramid manager</h1>
        <Loader check={organisationUnits} />
        <TextField
          autoFocus
          label={"Search"}
          onChange={this.handleFilterChange}
          value={this.props.filter || "name:ilike:"}
          margin="normal"
        />
        {organisationUnits && (
          <OrganisationUnitList
            organisationUnits={organisationUnits}
            organisationUnitGroupSets={organisationUnitGroupSets}
            openForEdition={this.openForEdition}
            fields={this.props.fields}
          />
        )}
      </React.Fragment>
    );
  }
}

export default OrganisationUnitsContainer;
