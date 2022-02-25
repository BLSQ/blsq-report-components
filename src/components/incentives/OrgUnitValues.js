import React from "react";
import { TableRow } from "@material-ui/core";
import CustomTableCell from "./CustomTableCell";
import EditIcon from "@material-ui/icons/Edit";
import { TextField } from "@material-ui/core";

const OrgUnitValues = (props) => {
  const { formInfos, de, ou, index, dataElementCommonPrefix, dsi, classes, dhis2 } = props;

  const strippedStyle = {
    backgroundColor: index % 2 === 1 ? "rgba(120, 120, 120, 0.05)" : "",
  };
  const strippedStyle2 = {
    backgroundColor: index % 2 === 1 ? "rgba(120, 120, 120, 0.05)" : "",
  };

  const largeText = de.dataElement.valueType === "TEXT";
  return (
    <TableRow>
      <CustomTableCell />
      <CustomTableCell
        title={de.dataElement.name + " \n" + de.dataElement.code + " " + de.dataElement.id}
        style={strippedStyle}
      >
        <span>{de.dataElement.name.slice(dataElementCommonPrefix.length, de.dataElement.name.length)}</span>
        {de.dataElement.code === undefined && (
          <a
            target="_blank"
            href={dhis2.url + "/dhis-web-maintenance/#/edit/dataElementSection/dataElement/" + de.dataElement.id}
          >
            <EditIcon width="2px" height="2px" />
          </a>
        )}
      </CustomTableCell>

      {dsi.periods.map((pe) => {
        const key = [
          de.dataElement.id,
          pe,
          ou.id,
          de.categoryOptionCombo ? de.categoryOptionCombo.id : dsi.defaultCategoryCombo.categoryOptionCombos[0].id,
          de.categoryOptionCombo ? de.categoryOptionCombo.id : dsi.defaultCategoryCombo.categoryOptionCombos[0].id,
        ];
        return (
          <CustomTableCell style={strippedStyle2}>
            <TextField
              className={largeText ? classes.textLargeField : classes.textField}
              error={formInfos.errors[key] !== undefined}
              label={formInfos.errors[key]}
              title={de.dataElement.name + " - " + ou.name + " - " + pe}
              value={formInfos.indexedValues[key] || ""}
              onChange={props.handleChange(key, de, pe, ou)}
              inputProps={{
                style: {
                  textAlign: "right",
                  backgroundColor: formInfos.valids[key] ? "#badbad" : "",
                },
              }}
            />
          </CustomTableCell>
        );
      })}
    </TableRow>
  );
};

export default OrgUnitValues;
