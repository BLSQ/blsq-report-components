import React, { Component } from "react";
import OrganisationUnitList from "./OrganisationUnitList";
import Loader from "./Loader";

class OrganisationUnitsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.dhis2 = this.props.dhis2;
    this.loadData = this.loadData.bind(this);
  }
  async loadData() {
    const organisationUnitsResponse = await this.dhis2.organisationUnits();
    let organisationUnits = organisationUnitsResponse.organisationUnits;
    /*organisationUnits = organisationUnits.filter(ou =>
      this.props.levels.includes(ou.level)
    );*/
    const organisationUnitGroupSetsResponse = await this.dhis2.organisationUnitGroupSets();
    let organisationUnitGroupSets =
      organisationUnitGroupSetsResponse.organisationUnitGroupSets;

    this.setState({ organisationUnits, organisationUnitGroupSets });
  }
  async componentDidMount() {
    this.loadData();
  }
  render() {
    const { organisationUnits, organisationUnitGroupSets } = this.state;
    return (
      <React.Fragment>
        <h1>Pyramid manager</h1>
        <Loader check={organisationUnits} />
        {organisationUnits && (
          <OrganisationUnitList
            organisationUnits={organisationUnits}
            organisationUnitGroupSets={organisationUnitGroupSets}
          />
        )}
      </React.Fragment>
    );
  }
}

export default OrganisationUnitsContainer;
