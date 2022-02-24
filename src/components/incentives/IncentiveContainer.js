import React, { Component } from "react";
import debounce from "lodash/debounce";
import { withStyles } from "@material-ui/core/styles";

import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import IncentiveNavigationBar from "./IncentiveNavigationBar";
import IncentiveSupport from "./IncentiveSupport";
import Loader from "../shared/Loader";
import Warning from "../shared/Warning";
import DatePeriods from "../../support/DatePeriods";
import OrgUnitLine from "./OrgUnitLine";
import OrgUnitValues from "./OrgUnitValues";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import PeriodPicker from "../shared/PeriodPicker";
import CustomTableCell from "./CustomTableCell";

import PluginRegistry from "../core/PluginRegistry";

const styles = (theme) => ({
  textField: {
    width: 100,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  textLargeField: {
    width: 170,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(10),
  },
});

class IncentiveContainer extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this);
    this.state = { errors: {}, valids: {} };

    this.setDataValue = debounce(this.setDataValue, 500);
  }

  handleChange = (key, de, pe, ou) => async (event) => {
    console.log(de.dataElement.name + ", " + pe + " " + ou.name + " " + event.target.value);
    this.setState({
      indexedValues: { ...this.state.indexedValues, [key]: event.target.value },
    });

    const value = {
      de: de.dataElement.id,
      co: this.state.dataSetInfos.defaultCategoryCombo.categoryOptionCombos[0].id,
      ds: this.state.dataSetInfos.dataSet.id,
      ou: ou.id,
      pe: pe,
      value: event.target.value,
    };
    this.setDataValue(key, value);
  };

  setDataValue = async (key, value) => {
    try {
      await this.props.dhis2.setDataValue(value);
      this.setState({ valids: { ...this.state.valids, [key]: true } });
      this.setState({ errors: { ...this.state.errors, [key]: undefined } });
    } catch (error) {
      this.setState({
        errors: { ...this.state.errors, [key]: error.message },
        valids: { ...this.state.valids, [key]: false },
      });
    }
  };

  async componentDidMount() {
    this.loadData();
    this.mounted = true;
  }

  async componentWillReceiveProps(nextProps) {
    this.props = nextProps;
    this.setState({
      dataSetInfos: undefined,
      error: undefined,
      errors: {},
    });
    this.loadData();
  }

  async loadData() {
    if (this.props.currentUser === undefined) {
      return;
    }
    //TODO display also last changes : http://liberia.dhis2.org/dhis/api/audits/dataValue?ds=Ouqnlj54RY4&period=2017July&period=2018July
    try {
      const dataSet = await this.props.dhis2.getDataSet(this.props.incentiveCode);
      console.info("DATASET :", dataSet);
      const periods = IncentiveSupport.computePeriods(dataSet.periodType, this.props.period);
      const values = await this.props.dhis2.getValues(this.props.currentUser, dataSet, periods);
      const defaultCategoryCombo = await this.props.dhis2.getDefaultCategoryCombo();
      const indexedValues = {};
      const project = PluginRegistry.extension("hesabu.project");
      const projectDescriptor = project(this.props.period);
      const incentiveCode = this.props.incentiveCode;
      const incentivesDescriptors = this.props.incentivesDescriptors;
      const incentive = incentivesDescriptors.filter((d) => d.dataSet === incentiveCode)[0];
      if (incentive && incentive.hesabuPayment) {
        const payment = projectDescriptor.payment_rules[incentive.hesabuPayment];
        const hesabuPackage = payment.packages[incentive.hesabuPackage];
        const orderedDataElementIds = hesabuPackage.activities.map((activity) => activity[incentive.hesabuState]);
        dataSet.dataSetElements.sort(function (a, b) {
          var x = orderedDataElementIds.indexOf(a.dataElement.id);
          var y = orderedDataElementIds.indexOf(b.dataElement.id);
          return x < y ? -1 : x > y ? 1 : 0;
        });
      } else {
        dataSet.dataSetElements.sort(function (a, b) {
          var x = a.dataElement.code;
          var y = b.dataElement.code;
          return x < y ? -1 : x > y ? 1 : 0;
        });
      }

      if (values.dataValues) {
        values.dataValues.forEach((dataValue) => {
          const key = [
            dataValue.dataElement,
            dataValue.period,
            dataValue.orgUnit,
            dataValue.categoryOptionCombo,
            dataValue.attributeOptionCombo,
          ];
          indexedValues[key] = dataValue.value;
        });
      }

      this.setState({
        indexedValues: indexedValues,
        dataSetInfos: {
          dataSet: dataSet,
          periods: periods,
          defaultCategoryCombo: defaultCategoryCombo.categoryCombos[0],
        },
      });
    } catch (error) {
      this.setState({
        error: "Sorry something went wrong, try refreshing or contact the support : " + error.message,
      });
      throw error;
    }
  }

  render() {
    const { classes, dhis2 } = this.props;
    if (this.state.error !== undefined) {
      return (
        <Paper className={classes.root}>
          <Typography variant="h6" style={{ marginRight: "20px" }}>
            Incentives
          </Typography>
          <IncentiveNavigationBar
            period={this.props.period}
            incentiveCode={this.props.incentiveCode}
            incentivesDescriptors={this.props.incentivesDescriptors}
          />
          <Warning message={this.state.error} />
        </Paper>
      );
    }
    if (this.state.dataSetInfos === undefined || this.props.currentUser === undefined) {
      return (
        <Paper className={classes.root}>
          <Typography variant="h6" style={{ marginRight: "20px" }}>
            Incentives
          </Typography>
          <IncentiveNavigationBar
            period={this.props.period}
            incentiveCode={this.props.incentiveCode}
            incentivesDescriptors={this.props.incentivesDescriptors}
          />
          <Typography>Incentives</Typography>
          <Loader />
        </Paper>
      );
    }
    const dsi = this.state.dataSetInfos;

    const dataElementCommonPrefix = IncentiveSupport.commonPrefix(
      dsi.dataSet.dataSetElements.map((de) => de.dataElement.name),
    );
    const formInfos = {
      errors: this.state.errors,
      indexedValues: this.state.indexedValues,
      valids: this.state.valids,
    };
    const allowedSeeOrgunitIds = dhis2.allowedSeeOrgunits(this.props.currentUser, dsi.dataSet).map((ou) => ou.id);

    const nonAllowedSee = dsi.dataSet.organisationUnits.filter((ou) => !allowedSeeOrgunitIds.includes(ou.id));
    return (
      <React.Fragment>
        <Paper className={classes.root}>
          <div>
            <div
              style={{ display: "flex", flexDirection: "row", alignContent: "center", justifyContent: "flex-start" }}
            >
              <Typography variant="h6" style={{ marginRight: "20px" }}>
                Incentives
              </Typography>
              <div>
                <PeriodPicker
                  disableInputLabel={true}
                  period={this.props.period}
                  periodDelta={{
                    before: 5,
                    after: 5,
                  }}
                  onPeriodChange={(newPeriod) => {
                    this.props.history.push("/incentives/" + newPeriod + "/" + this.props.incentiveCode);
                  }}
                ></PeriodPicker>
              </div>
            </div>
          </div>
          <div style={{marginLeft:"20px"}}>
          {this.props.incentivesDescriptors && this.props.incentivesDescriptors.length > 0 && (
            <IncentiveNavigationBar
              period={this.props.period}
              incentiveCode={this.props.incentiveCode}
              incentivesDescriptors={this.props.incentivesDescriptors}
            />
          )}
          <Typography variant="headline">{dsi.dataSet.name}</Typography>
          <br />
          <Table padding="none">
            <TableHead>
              <TableRow>
                <CustomTableCell>OrgUnit</CustomTableCell>
                <CustomTableCell>Data element</CustomTableCell>
                {dsi.periods.map((p) => (
                  <CustomTableCell key={p} title={p}>
                    {DatePeriods.displayName(p, this.props.periodFormat[DatePeriods.detect(p)])}
                  </CustomTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody key={dsi.dataSet.name}>
              {dsi.dataSet.organisationUnits
                .filter((ou) => allowedSeeOrgunitIds.includes(ou.id))
                .map((ou) => {
                  return (
                    <React.Fragment>
                      <OrgUnitLine ou={ou} dsi={dsi} dhis2={this.props.dhis2} periodFormat={this.props.periodFormat}/>
                      {dsi.dataSet.dataSetElements.map((de, index) => (
                        <OrgUnitValues
                          de={de}
                          ou={ou}
                          dsi={dsi}
                          index={index}
                          dataElementCommonPrefix={dataElementCommonPrefix}
                          classes={classes}
                          formInfos={formInfos}
                          handleChange={this.handleChange}
                          dhis2={dhis2}
                        />
                      ))}
                    </React.Fragment>
                  );
                })}
            </TableBody>
          </Table>
          {nonAllowedSee.length > 1 && (
            <p>You are not allowed to see : {nonAllowedSee.map((ou) => ou.name).join(", ")}</p>
          )}
          </div>
        </Paper>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(IncentiveContainer);
