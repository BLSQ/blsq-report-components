import React, { Component } from "react";
import BrowseDataContainer from "./BrowseDataContainer";

class BrowseDataPage extends Component {
  componentWillReceiveProps(props) {
    if (props.onPeriodChange) {
      props.onPeriodChange(props.match.params.period);
    }
  }

  render() {
    return (
      <BrowseDataContainer
        period={this.props.match.params.period}
        dataElementGroupId={this.props.match.params.dataElementGroupId}
        orgUnitId={this.props.match.params.orgUnitId}
        withChildren={this.props.match.params.withChildren}
        currentUser={this.props.currentUser}
      />
    );
  }
}

export default BrowseDataPage;
