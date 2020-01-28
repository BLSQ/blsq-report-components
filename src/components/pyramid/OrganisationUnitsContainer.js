import React, { Component } from "react";
import OrganisationUnitList from "./OrganisationUnitList";
import Loader from "./Loader";

class OrganisationUnitsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.dhis2 = this.props.dhis2;
    this.loadData = this.loadData.bind(this);
    this.openForEdition = this.openForEdition.bind(this);
  }

  openForEdition(ou) {
    this.props.history.replace({
      pathname: "/pyramid/" + ou.id
    });
  }

  async loadData() {
    const filter = this.props.filter;

    const organisationUnitsResponse = await this.dhis2.organisationUnits(
      this.props.fields,
      filter ? "&filter="+filter : undefined
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
            openForEdition={this.openForEdition}
            fields={this.props.fields}
          />
        )}
      </React.Fragment>
    );
  }
}

export default OrganisationUnitsContainer;
