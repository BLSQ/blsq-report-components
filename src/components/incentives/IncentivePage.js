import React, { Component } from "react";
import IncentiveContainer from "./IncentiveContainer";

class IncentivePage extends Component {
  componentWillReceiveProps(props) {
    if (props.onPeriodChange) {
        props.onPeriodChange(props.match.params.period);
    }
  }

  render() {
    return (
      <IncentiveContainer
        period={this.props.match.params.period}
        incentiveCode={this.props.match.params.incentiveCode}
        incentivesDescriptors={this.props.incentivesDescriptors}
        currentUser={this.props.currentUser}
        groups={this.props.groups}
        dhis2={this.props.dhis2}
      />
    );
  }
}

export default IncentivePage;
