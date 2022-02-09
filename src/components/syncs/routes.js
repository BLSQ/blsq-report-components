import React from "react";
import SyncDataSet from "./datasets/SyncDataSet";
import { Route } from "react-router-dom";
import SyncProgramGroups from "./groups/SyncProgramGroups";

export const syncsRoutes = (props) => {
  return [
    <Route
      key="sync"
      exact
      path="/sync/datasets/:period"
      render={(routerProps) => {
        return <SyncDataSet {...props} {...routerProps} />;
      }}
    />,
    <Route
      key="sync-programgroups"
      exact
      path="/sync/program-groups/:period"
      render={(routerProps) => {
        return <SyncProgramGroups {...props} {...routerProps} />;
      }}
    />,
  ];
};
