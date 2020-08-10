import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces } from "react-i18next";

const styles = {
  rowStyle: {
    verticalAlign: "top",
    textAlign: "left",
  },
};

const ErrorsTable = ({ t, classes, errors, indexedOrgUnits }) => (
  <div>
    <h1>{t("invoicing.job.errors")}</h1>
    <table width="100%" className={classes.rowStyle}>
      <thead>
        <tr>
          <th>{t("invoicing.job.period")}</th>
          <th>{t("invoicing.job.orgUnit")}</th>
          <th>{t("invoicing.job.erroredAt")}</th>
          <th>{t("invoicing.job.error")}</th>
        </tr>
      </thead>
      <tbody>
        {errors.map((error, index) => {
          return (
            <tr key={"error-" + index}>
              <td>{error.attributes.dhis2Period}</td>
              <td>
                {indexedOrgUnits[error.attributes.orgUnit]
                  ? indexedOrgUnits[error.attributes.orgUnit].name
                  : error.attributes.orgUnit}
              </td>
              <td>{error.attributes.erroredAt.replace("T", " ")}</td>{" "}
              <td width="60%">{error.attributes.lastError}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

ErrorsTable.propTypes = {
  t: PropTypes.func.isRequired,
  errors: PropTypes.array.isRequired,
  indexedOrgUnits: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(withNamespaces()(ErrorsTable));
