import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { Link } from "react-router-dom";

const DegNavigationBar = props => {
  return (
    <React.Fragment>
      <Tabs value={props.dataElementGroupId}>
        {props.dataElementGroups.map(group => (
          <Tab
            key={group.id}
            value={group.id}
            label={group.name}
            component={Link}
            to={
              "/data/" +
              props.period +
              "/deg/" +
              group.id +
              "/" +
              props.orgUnitId +
              "/children"
            }
          />
        ))}
      </Tabs>
      <br />
    </React.Fragment>
  );
};
export default DegNavigationBar;
