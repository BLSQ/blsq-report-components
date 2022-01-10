import React, { Component } from "react";
import PluginRegistry from "../core/PluginRegistry";
import BrowseDataContainer from "./BrowseDataContainer";

class BrowseDataPage extends Component {
  componentWillReceiveProps(props) {
    if (props.onPeriodChange) {
      props.onPeriodChange(props.match.params.period);
    }
  }

  render() {
    const groups = PluginRegistry.extension("browseData.dataElementGroups");
    return (
      <BrowseDataContainer
        {...this.props}
        period={this.props.match.params.period}
        dataElementGroupId={this.props.match.params.dataElementGroupId}
        orgUnitId={this.props.match.params.orgUnitId}
        withChildren={this.props.match.params.withChildren}
        currentUser={this.props.currentUser}
        dataElementGroups={groups}
        dhis2={this.props.dhis2}
      />
    );
  }
}

export default BrowseDataPage;
