import React, { Component } from "react";
import IncentiveContainer from "./IncentiveContainer";
import PluginRegistry from "../core/PluginRegistry"

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
        periodFormat ={this.props.periodFormat}
        incentiveCode={this.props.match.params.incentiveCode}
        incentivesDescriptors={PluginRegistry.extension("incentives.incentivesDescriptors") || []}
        currentUser={this.props.currentUser}
        groups={this.props.groups}
        dhis2={this.props.dhis2}
        history={this.props.history}
      />
    );
  }
}

export default IncentivePage;
