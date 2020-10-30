import React from "react";
import DatePeriods from "../../support/DatePeriods";
import { Grid, Typography } from "@material-ui/core";
import Dhis2Input from "./Dhis2Input"

const allDataEntries = [
  {
    code: "pma-quantity-v2020",
    frequency: "monthly",
    name: "Quantity PMA",
    type: "dataSet",
    dataSetId: "OH9vp1o9EN9",
  },
  {
    code: "pma-quality-v2020",
    frequency: "quarterly",
    name: "Quality PMA",
    type: "iaso",
    dataSetId: "NFfjUnVUjlk",
  },
  {
    code: "vignette-v2020",
    frequency: "quarterly",
    name: "Vignette",
    type: "dataSet",
  },
];
const dataEntryForms = {
  "pma-quantity-v2020": (props) => (
    <div>
      <h2>PMA : Quantity form</h2>
      <br></br>
      <Grid container direction="column" spacing={4} alignItems="center">
        <Grid container direction="row" spacing={4}>
          <Grid item xs={1}>
            <Typography>Activity</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>Declared</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>Verified</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>Incentive</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>Amount</Typography>
          </Grid>
        </Grid>
        {[1, 2, 3, 4, 6, 5].map((index) => (
          <Grid key={"activity-" + index} container direction="row" spacing={4} alignItems="center">
            <Grid item xs={1}>
              <Typography>quantity {index}</Typography>
            </Grid>
            <Grid item xs={1}>
              <Dhis2Input dataElement={"lXbpVIzzwef.HllvX50cXC0"}></Dhis2Input>
            </Grid>
            <Grid item xs={1}>
              <Dhis2Input dataElement={"VBIYcOJSmpU"}></Dhis2Input>
            </Grid>
            <Grid item xs={1}>
              <Dhis2Input dataElement={"de2"}></Dhis2Input>
            </Grid>
            <Grid item xs={1}>
              <Dhis2Input dataElement={"de3"}></Dhis2Input>
            </Grid>
          </Grid>
        ))}
      </Grid>
    </div>
  ),
  "pma-quality-v2020": (props) => (
    <div>
      <h2>PMA : Quality form</h2>
    </div>
  ),
};

class DataEntries {
  getDataEntry(code) {
    return allDataEntries.find((de) => de.code === code);
  }

  getExpectedDataEntryTypes(activeContract, period) {
    return allDataEntries;
  }

  getExpectedDataEntries(activeContract, period) {
    const quarter = DatePeriods.split(period, "quarterly")[0];
    return this.getExpectedDataEntryTypes(activeContract, quarter).flatMap((dataEntryType) => {
      return DatePeriods.split(quarter, dataEntryType.frequency).map((entryPeriod) => {
        return { dataEntryType: dataEntryType, period: entryPeriod };
      });
    });
  }

  getDataEntryForm(dataEntryCode) {
    return dataEntryForms[dataEntryCode];
  }
}

export default new DataEntries();
