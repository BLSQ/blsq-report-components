import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import PluginRegistry from "../core/PluginRegistry";
import _ from "lodash";
import DatePeriods from "../../support/DatePeriods";
import MUIDataTable, { ExpandButton } from "mui-datatables";
import { TableRow, TableCell, Typography, Paper, Button } from "@material-ui/core";

import { makeStyles } from "@material-ui/styles";
import PeriodPicker from "../shared/PeriodPicker";
import { Alert } from "@material-ui/lab";

const humanize = (str) => {
  return str[0] + str.slice(1).toLowerCase();
};

const buildApprovals = (results, periods, orgUnits) => {
  const approvalsByOrgUnitPeriod = _.groupBy(results, (r) => r.orgUnit.id + r.approval.pe);
  const approvals = [];
  for (let orgUnit of orgUnits) {
    const result = { orgUnit: orgUnit };
    let atleastOneData = false;
    for (let period of periods) {
      const approval = approvalsByOrgUnitPeriod[orgUnit.id + period];
      result[period] = approval ? approval[0] : undefined;
      if (atleastOneData == false && approval && approval[0]) {
        atleastOneData = true;
      }
    }
    if (atleastOneData) {
      approvals.push(result);
    }
  }
  return approvals;
};

const buildColumns = (approvals, levels, periods, loadApprovalsQuery, dhis2) => {
  const columns = [];
  columns.push({
    name: "ancestors[1].name",
    label: "Level1",
    options: {
      filter: true,
      customBodyRenderLite: (dataIndex) => {
        const orgUnit = approvals[dataIndex]["orgUnit"];
        return <span>{orgUnit.ancestors && orgUnit.ancestors[1] && orgUnit.ancestors[1].name}</span>;
      },
    },
  });
  columns.push({
    name: "orgUnit.name",
    label: "name",
    options: {
      filter: true,
      customBodyRenderLite: (dataIndex) => {
        const orgUnit = approvals[dataIndex]["orgUnit"];
        const isbold = levels[0] == orgUnit.level;
        return (
          <span style={{ marginLeft: orgUnit.level * 30 + "px", fontWeight: isbold ? "bold" : "" }}>
            {orgUnit.name}
          </span>
        );
      },
    },
  });
  for (let period of periods) {
    const column = {
      name: `${period}.approval.state`,
      label: period,
      options: {
        filter: true,
        customBodyRenderLite: (dataIndex) => {
          const data = approvals[dataIndex][period];

          const permissions = data?.approval?.permissions;
          const handleSaveMutation = useMutation(
            async ({ approval, mode }) => {
              const api = await dhis2.api();
              if (mode === "approve") {
                const approved = await api.post(
                  "dataApprovals?wf=" +
                    approval.approval.wf +
                    "&pe=" +
                    approval.approval.pe +
                    "&aoc=" +
                    approval.approval.aoc +
                    "&ou=" +
                    approval.approval.ou,
                );
              } else if (mode === "unapprove") {
                const approved = await api.delete(
                  "dataApprovals?wf=" +
                    approval.approval.wf +
                    "&pe=" +
                    approval.approval.pe +
                    "&aoc=" +
                    approval.approval.aoc +
                    "&ou=" +
                    approval.approval.ou,
                );
                console.log(approved);
              } else {
                throw new Error("unsupported mode: '" + mode + "'");
              }
              return approval;
            },
            {
              onSuccess: () => {
                return loadApprovalsQuery.refetch();
                //dispatch(enqueueSnackbar(succesfullSnackBar("snackBar.success.save")));
              },
              onError: (error) => {
                //dispatch(enqueueSnackbar(errorSnackBar("snackBar.error.save", null, error)));
              },
            },
          );

          if (data && data.approval) {
            return (
              <span title={data.approval.wf + "\n" + JSON.stringify(data.approval, undefined, 3)}>
                <span style={{ color: data.approval.state.startsWith("APPROVED") ? "grey" : "" }}>
                  {data.approval.state
                    .split("_")
                    .map((n) => humanize(n))
                    .join(" ")}
                </span>
                <br></br>
                {permissions.mayApprove && !data.approval.state.startsWith("APPROVED") && (
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={handleSaveMutation.isLoading}
                    onClick={() => handleSaveMutation.mutate({ approval: data, mode: "approve" })}
                  >
                    Approve
                  </Button>
                )}
                {permissions.mayUnapprove && (
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={handleSaveMutation.isLoading}
                    onClick={() => handleSaveMutation.mutate({ approval: data, mode: "unapprove" })}
                  >
                    Unapprove
                  </Button>
                )}
              </span>
            );
          }
          return "";
        },
      },
    };
    columns.push(column);
  }

  return columns;
};

// http://localhost:3000/#/approvals/norJGorVlsf,kxzOOv3ztkc/2021Q1

const Approvals = (props) => {
  const dhis2 = PluginRegistry.extension("core.dhis2");
  const queryClient = useQueryClient();
  const quarterPeriod = props.match.params.period;
  const [loadingStatus, setLoadingStatus] = useState();

  const loadApprovalsQuery = useQuery("loadApprovals", async () => {
    const api = await dhis2.api();
    const workflowIds = props.match.params.workflowids.split(",");
    const periodRef = quarterPeriod;
    setLoadingStatus("data approval workflows");
    const workflows = (
      await api.get("dataApprovalWorkflows", {
        fields: "id,name,periodType,dataApprovalLevels[orgUnitLevel]",
        filter: ["id:in:[" + workflowIds.join(",") + "]"],
      })
    ).dataApprovalWorkflows;
    const me = await api.get("me?fields=:all,organisationUnits[id,name]");
    const levels = workflows
      .flatMap((wf) => wf.dataApprovalLevels)
      .map((da) => da.orgUnitLevel)
      .sort();

    setLoadingStatus("organisationUnits");

    let ou = undefined;
    for (let meOrgUnit of me.organisationUnits) {
      const ouCurrent = await api.get("organisationUnits", {
        filter: [
          "path:ilike:" + meOrgUnit.id,
          "level:in:[" +
            workflows
              .flatMap((wf) => wf.dataApprovalLevels)
              .map((da) => da.orgUnitLevel)
              .join(",") +
            "]",
        ],
        paging: false,
        fields: "id,name,level,path,ancestors[id,name]",
      });
      if (ou == undefined) {
        ou = ouCurrent;
      } else {
        ou.organisationUnits = ou.organisationUnits.concat(ouCurrent.organisationUnits);
      }
    }

    const results = [];
    const orgUnits = _.sortBy(ou.organisationUnits, (o) => o.path);
    for (let orgUnit of orgUnits) {
      if (orgUnit.ancestors) {
        orgUnit.ancestors.forEach((a, index) => (orgUnit["level" + (index + 1)] = a));
      }
    }
    const orgUnitsById = _.keyBy(orgUnits, (o) => o.id);
    const periods = workflows.flatMap((wf) => {
      return DatePeriods.split(periodRef, wf.periodType.toLowerCase());
    });
    setLoadingStatus("data approvals");

    let chunks = _.chunk(orgUnits, 50);
    let chunkIndex = 1;
    for (let orgUnitChunk of chunks) {
      setLoadingStatus("data approvals " + chunkIndex + "/" + chunks.length);
      chunkIndex = chunkIndex + 1;
      for (let workflow of workflows) {
        const levels = workflow.dataApprovalLevels.map((wf) => wf.orgUnitLevel).sort();
        const orgUnitsForWf = orgUnitChunk.filter((o) => levels.includes(o.level)).map((o) => o.id);
        if (orgUnitsForWf.length > 0) {
          const approvals = await api.get("dataApprovals/approvals", {
            pe: periods.filter((p) => DatePeriods.detect(p) === workflow.periodType.toLowerCase()),
            ou: orgUnitsForWf,
            wf: workflow.id,
            fields: ":all",
          });

          for (let approval of approvals) {
            results.push({ orgUnit: orgUnitsById[approval.ou], approval });
          }
        }
      }
    }
    const nonEmptyApprovals = results.filter((a) => a.approval.state && a.approval.state !== "UNAPPROVED_ABOVE");

    return {
      approvals: buildApprovals(nonEmptyApprovals, periods, orgUnits),
      periods: periods,
      levels: levels,
    };
  });

  const data = loadApprovalsQuery?.data;
  const options = {
    selectableRows: "none",
    rowsPerPage: 50,
    rowsPerPageOptions: [1, 5, 10, 20, 50, 100, 1000],
    enableNestedDataAccess: ".",
    downloadOptions: {
      filename: "orgunit-approvals-" + quarterPeriod + ".csv",
      separator: ",",
    },
  };
  let columns;
  if (data) {
    columns = buildColumns(data.approvals, data.levels, data.periods, loadApprovalsQuery, dhis2);
  }

  const isLoading = loadApprovalsQuery.isLoading || loadApprovalsQuery.isRefetching;
  return (
    <div>
      {isLoading && <Alert severity="info">Loading ... {loadingStatus}</Alert>}
      {loadApprovalsQuery.error && <span style={{ color: "red" }}>{loadApprovalsQuery.error}</span>}
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
          <div style={{ background: "rgba(255, 255, 255, 0.20)", color: "#fff; important!", padding: "5px" }}>
            <PeriodPicker
              disableInputLabel={true}
              period={quarterPeriod}
              periodDelta={{
                before: 5,
                after: 5,
              }}
              onPeriodChange={(newPeriod) => {
                const newUrl = window.location.href.replace("/" + quarterPeriod, "/" + newPeriod);
                window.history.pushState({}, "", newUrl);
                window.location.reload();
              }}
            />
          </div>
        </div>
      </Paper>
      <br />
      {data && <MUIDataTable data={data.approvals} columns={columns} options={options} />}
      <br />

      <Paper elevation={3}>
        <table>
          <tr>
            <td>UNAPPROVABLE</td>{" "}
            <td>Data approval does not apply to this selection. (Data is neither approved nor unapproved.)</td>
          </tr>
          <tr>
            <td>UNAPPROVED_WAITING</td>
            <td>
              {" "}
              Data could be approved for this selection, but is waiting for some lower-level approval before it is ready
              to be approved.
            </td>
          </tr>
          <tr>
            <td>UNAPPROVED_ELSEWHERE</td>
            <td> Data is unapproved, and is waiting for approval somewhere else (not approvable here.)</td>
          </tr>
          <tr>
            <td>UNAPPROVED_READY</td>
            <td> Data is unapproved, and is ready to be approved for this selection.</td>
          </tr>
          <tr>
            <td>APPROVED_HERE</td>
            <td> Data is approved, and was approved here (so could be unapproved here.)</td>
          </tr>
          <tr>
            <td>APPROVED_ELSEWHERE</td>
            <td>
              {" "}
              Data is approved, but was not approved here (so cannot be unapproved here.) This covers the following
              cases: Data is approved at a higher level. Data is approved for wider scope of category options. Data is
              approved for all sub-periods in selected period. In the first two cases, there is a single data approval
              object that covers the selection. In the third case there is not.
            </td>
          </tr>
          <tr>
            <td>ACCEPTED_HERE</td>
            <td> Data is approved and accepted here (so could be unapproved here.)</td>
          </tr>
          <tr>
            <td>ACCEPTED_ELSEWHERE</td>
            <td> Data is approved and accepted, but elsewhere.</td>
          </tr>
        </table>
      </Paper>
    </div>
  );
};

export default Approvals;
