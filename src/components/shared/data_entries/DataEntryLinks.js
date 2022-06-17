import React from "react";
import DatePeriods from "../../../support/DatePeriods";
import { Button, List, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";

const DataEntryLinks = ({ dataEntries, dataEntryCode, period, orgUnit, periodFormat }) => {
  return (
    <List style={{paddingTop : "0px"}}>
    {dataEntries.map((dataEntry) => {
        const isCurrent = dataEntry.dataEntryType.code === dataEntryCode && dataEntry.period === period;
        return (
          <li style={{display: "flex"}}>
            <div>
              <Typography variant="overline" gutterBottom>
                {dataEntry.dataEntryType.name}
              </Typography>
            </div>
            <div>
              <Button
                key={dataEntry.dataEntryType.code + "-" + dataEntry.period + "-" + orgUnit.id}
                variant="text"
                color="primary"
                size="small"
                component={Link}
                style={isCurrent ? { backgroundColor: "lightyellow" } : {}}
                to={"/dataEntry/" + orgUnit.id + "/" + dataEntry.period + "/" + dataEntry.dataEntryType.code}
                title={dataEntry.period}
              >
                {DatePeriods.displayName(dataEntry.period, periodFormat[DatePeriods.detect(dataEntry.period)])}
              </Button>
            </div>
          </li>
        );
      })}
    </List>
  );
};

export default DataEntryLinks;
