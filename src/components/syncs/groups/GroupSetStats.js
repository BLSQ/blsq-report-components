import React from "react";

const StatSpan = ({ stat }) => {
  return <span style={{ color: stat > 0 ? "" : "grey" }}>{stat}</span>;
};

const GroupSetStats = ({ groupStats }) => (
  <table>
    <thead>
      <tr>
        <th width="200px">Group</th>
        <th width="100px">Add</th>
        <th width="100px">Remove</th>
        <th width="100px">Keep</th>
      </tr>
    </thead>
    <tbody>
      {groupStats
        .sort((a, b) => (a.group.name > b.group.name ? 1 : -1))
        .map((groupInfo) => {
          return (
            <tr key={groupInfo.group.name}>
              <td>{groupInfo.group.name}</td>
              <td style={{ textAlign: "right" }}>
                <StatSpan stat={groupInfo.stats.add || 0} />
              </td>
              <td style={{ textAlign: "right" }}>
                <StatSpan stat={groupInfo.stats.remove || 0} />
              </td>
              <td style={{ textAlign: "right" }}>
                <StatSpan stat={groupInfo.stats.keep || 0} />
              </td>
            </tr>
          );
        })}
    </tbody>
  </table>
);

export default GroupSetStats;
