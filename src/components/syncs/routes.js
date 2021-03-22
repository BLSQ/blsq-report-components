import React from "react";
import SyncDataSet from "./SyncDataSet";
import { Route } from "react-router-dom";

export const syncsRoutes = (props) => {
  return [
    <Route
      key="sync"
      exact
      path="/sync/datasets/:period"
      render={(routerProps) => {
        return <SyncDataSet {...props} />;
      }}
    />,
  ];
};
