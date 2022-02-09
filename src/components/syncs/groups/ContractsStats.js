import React from "react";
import GroupSetStats from "./GroupSetStats";
import _ from "lodash";

const ContractsStats = ({ groupStats, groupSetIndex }) => (
  <div style={{ display: "flex", flexWrap: "wrap" }}>
    {groupStats &&
      Object.values(_.groupBy(groupStats, (s) => s.group.groupSetCode)).map((stats, index) => (
        <div key={index} style={{ margin: "10px" }}>
          <h4>{groupSetIndex.groupSetsByCode[stats[0].group.groupSetCode].name}</h4>
          <GroupSetStats groupStats={stats} />
        </div>
      ))}
  </div>
);

export default ContractsStats;
