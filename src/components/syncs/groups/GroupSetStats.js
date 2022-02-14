import React from "react";
import { useTranslation } from "react-i18next";

const StatSpan = ({ stat }) => {
  return <span style={{ color: stat > 0 ? "" : "grey" }}>{stat}</span>;
};

const GroupSetStats = ({ groupStats }) => {
  const { t } = useTranslation();
  return (
    <table>
      <thead>
        <tr>
          <th width="200px">{t("group")}</th>
          <th width="100px">{t("add")}</th>
          <th width="100px">{t("remove")}</th>
          <th width="100px">{t("keep")}</th>
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
};
export default GroupSetStats;
