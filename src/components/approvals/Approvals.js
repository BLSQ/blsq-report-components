import React, { useState } from "react";
import { useQuery } from "react-query";
import PluginRegistry from "../core/PluginRegistry";
import _ from "lodash";
import DatePeriods from "../../support/DatePeriods";
import MUIDataTable, { ExpandButton } from "mui-datatables";
import { TableRow, TableCell, Typography, Paper } from "@material-ui/core";

import { makeStyles } from "@material-ui/styles";

const buildApprovals = (results, periods, orgUnits) => {
  const approvalsByOrgUnitPeriod = _.groupBy(results, (r) => r.orgUnit.id + r.approval.pe);
  const approvals = [];
  for (let orgUnit of orgUnits) {
    const result = { orgUnit: orgUnit };
    for (let period of periods) {
      const approval = approvalsByOrgUnitPeriod[orgUnit.id + period];
      result[period] = approval ? approval[0] : undefined;
    }
    approvals.push(result);
  }
  return approvals;
};

const buildColumns = (approvals) => {
  const columns = [];
  const periods = Object.keys(approvals[0]).filter((k) => k !== "orgUnit");
  const orgUnitColumn = {
    name: "",
    label: "orgUnit",
    options: {
      filter: true,
      customBodyRenderLite: (dataIndex) => {
        const orgUnit = approvals[dataIndex]["orgUnit"];
        return <span>{orgUnit.name}</span>;
      },
    },
  };
  columns.push(orgUnitColumn);
  for (let period of periods) {
    const column = {
      name: period,
      label: `${period}`,
      options: {
        filter: true,
        customBodyRenderLite: (dataIndex) => {
          return <span>something</span>;
        },
      },
    };
    columns.push(column);
  }

  return columns;
};

const Approvals = () => {
  const dhis2 = PluginRegistry.extension("core.dhis2");
  const loadApprovalsQuery = useQuery("loadApprovals", async () => {
    const api = await dhis2.api();
    const workflowIds = ["norJGorVlsf", "kxzOOv3ztkc"];
    const periodRef = "2022Q1";
    const workflows = (
      await api.get("dataApprovalWorkflows", {
        fields: "periodType,dataApprovalLevels[orgUnitLevel]",
        filter: ["id:in:[" + workflowIds.join(",") + "]"],
      })
    ).dataApprovalWorkflows;
    const me = await api.get("me?fields=:all,organisationUnits[id,name,children[id,name]]");
    const ou = await api.get("organisationUnits", {
      filter: [
        "path:ilike:" + me.organisationUnits[0].id,
        "level:in:[" +
          workflows
            .flatMap((wf) => wf.dataApprovalLevels)
            .map((da) => da.orgUnitLevel)
            .join(",") +
          "]",
      ],
      paging: false,
      fields: "id,name,level,path",
    });

    const results = [];
    const orgUnits = _.sortBy(ou.organisationUnits, (o) => o.path);
    const orgUnitsById = _.keyBy(orgUnits, (o) => o.id);
    const periods = workflows.flatMap((wf) => {
      return DatePeriods.split(periodRef, wf.periodType.toLowerCase());
    });

    for (let orgUnitChunk of _.chunk(orgUnits, 100)) {
      const approvals = await api.get("dataApprovals/approvals", {
        pe: periods,
        ou: orgUnitChunk.map((o) => o.id),
        wf: "kxzOOv3ztkc",
        fields: ":all",
      });

      for (let approval of approvals) {
        results.push({ orgUnit: orgUnitsById[approval.ou], approval });
      }
    }

    return buildApprovals(results, periods, orgUnits);
  });

  const approvals = loadApprovalsQuery?.data;
  const options = {
    download: false,
    selectableRows: "none",
    elevation: 0,
  };
  let columns;
  if (approvals) {
    columns = buildColumns(approvals);
  }
  
  return (
    <div>
      <Paper elevation={3}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignContent: "center",
            justifyContent: "flex-start",
            margin: "12px",
          }}
        >
          <Typography variant="h6" style={{ marginRight: "20px" }}>
            Approvals
          </Typography>
        </div>
      </Paper>
      <br />
      {approvals && approvals.length}
      <br />
      <MUIDataTable data={approvals} columns={columns} options={options} />
      <br />
    </div>
  );
};

export default Approvals;
