import React from "react";
import TableRow from "@material-ui/core/TableRow";
import CustomTableCell from "./CustomTableCell";
import CopyValuesDialogButton from "./CopyValuesDialogButton";

const orgunitLineStyle = {
  backgroundColor: "lightGrey",
  textAlign: "left",
  fontSize: 14,
};

const OrgUnitLine = (props) => {
  const { ou, dsi, dhis2, periodFormat } = props;
  return (
    <TableRow>
      <CustomTableCell colSpan="2" style={orgunitLineStyle} title={ou.ancestors.map((a) => a.name).join(" > ")}>
        <b>{ou.name}</b>
      </CustomTableCell>
      {dsi.periods.map((period) => (
        <CopyValuesDialogButton
          key={"copy-" + period}
          fromPeriods={dsi.periods}
          toPeriod={period}
          orgUnit={ou}
          dsi={dsi}
          dhis2={dhis2}
          periodFormat={periodFormat}
        />
      ))}
    </TableRow>
  );
};

export default OrgUnitLine;
