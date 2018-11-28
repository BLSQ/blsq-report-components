import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { Link } from "react-router-dom";

const IncentiveNavigationBar = props => {
  return (
    <React.Fragment>
      <Tabs value={props.incentiveCode}>
        {props.incentivesDescriptors.map(descriptor => (
          <Tab
            value={descriptor.dataSet}
            label={descriptor.name}
            component={Link}
            to={"/incentives/" + props.period + "/" + descriptor.dataSet}
          />
        ))}
      </Tabs>
      <br />
    </React.Fragment>
  );
};
export default IncentiveNavigationBar;
