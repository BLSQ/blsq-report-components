import React from "react";
import Box from "@material-ui/core/Box";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import PluginRegistry from "../core/PluginRegistry";
import PropTypes from "prop-types";
import InvoiceLinks from "./InvoiceLinks";
import Tooltip from "@material-ui/core/Tooltip";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import { Typography } from "@material-ui/core";
import ExtensionsComponent from "../core/ExtensionsComponent";

const styles = (theme) => ({});

const contractsToTooltip = (orgUnit, period) => {
  if (orgUnit.contracts === undefined) {
    return "";
  }
  return orgUnit.contracts.map((c, index) => (
    <div key={index}>
      {c.codes.join(",") + " : " + c.startPeriod + " " + c.endPeriod + " " + (c.matchPeriod(period) ? "**" : "")}
    </div>
  ));
};

const SelectionResultsContainer = (props) => {
  const { classes, t, orgUnits, levels, period, pager } = props;
  const invoices = PluginRegistry.extension("invoices.invoices");
  const filteredOrgunits = [];
  const omitedOrgunits = [];

  if (orgUnits)
    for (let ou of orgUnits) {
      const codes = invoices.getInvoiceTypeCodes(ou, period);
      // WARN if you modify this code check a project (ex ethiopia) that don't have contracts or no data entry
      const activeContract = ou.activeContracts && ou.activeContracts[0];     
      const dataEntries = PluginRegistry.extension("dataentry.dataEntries");
      const dataEntryCodes = activeContract ? dataEntries.getExpectedDataEntries(activeContract, period) : [];
      // display the orgunit if some invoices or if some data entry (note having a data entry, doesn't imply having invoices, (ex burundi))
      if ((codes && codes.length > 0) || dataEntryCodes.length > 0) {
        filteredOrgunits.push(ou);
      } else {
        omitedOrgunits.push(ou);
      }
    }
  const omitedCount = omitedOrgunits.length;
  return (
    <React.Fragment>
      {orgUnits && pager && pager.nextPage && <b style={{ color: "darkblue" }}>{t("invoices.refineYourQuery")}</b>}
      {orgUnits && (
        <span
          style={{ float: "right", color: "grey" }}
          title={omitedOrgunits
            .slice(0, 20)
            .map((o) => o.name)
            .join("\n")}
        >
          {t("invoices.displayStatus", { displayCount: filteredOrgunits.length, omitedCount: omitedCount })}
        </span>
      )}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{levels.slice(1).join(" > ")}</TableCell>
            <TableCell>{t("name")}</TableCell>
            <TableCell>{t("invoice")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orgUnits &&
            filteredOrgunits &&
            filteredOrgunits.map((orgUnit, index) => (
              <TableRow key={orgUnit.id + index}>
                <TableCell>
                  <Box>
                    <Typography>
                      {orgUnit.ancestors
                        .slice(1)
                        .map((a) => a.name)
                        .join(" > ")}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell component="th" scope="row">
                  <Tooltip
                    title={
                      <div>
                        {orgUnit.id} -{orgUnit.organisationUnitGroups.map((g) => g.name).join(", ")}
                        <br />
                        {contractsToTooltip(orgUnit, period)}
                      </div>
                    }
                  >
                    <Box fontWeight="fontWeightBold">{orgUnit.name}</Box>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <InvoiceLinks orgUnit={orgUnit} hideCurrentInvoice={false} {...props} />
                  <ExtensionsComponent extensionKey="invoices.selectionLinks" orgUnit={orgUnit} {...props} />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
};

SelectionResultsContainer.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(withTranslation()(SelectionResultsContainer));
