import React, { Component } from "react";
import debounce from "lodash/debounce";

import TextField from "@material-ui/core/TextField";
import EditIcon from "@material-ui/icons/Edit";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";

import IncentiveNavigationBar from "./IncentiveNavigationBar";
import IncentiveSupport from "./IncentiveSupport";
import Loader from "../shared/Loader";
import Warning from "../shared/Warning";
import Dhis2 from "../../support/Dhis2";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: "#266696",
    color: theme.palette.common.white,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "18px"
  },
  root: {
    textAlign: "left",
    align: "center"
  }
}))(TableCell);

const OrgUnitLine = props => {
  const { ou } = props;
  return (
    <TableRow>
      <CustomTableCell
        colSpan="40"
        style={{
          backgroundColor: "lightGrey",
          textAlign: "left",
          fontSize: 14
        }}
        title={ou.ancestors.map(a => a.name).join(" > ")}
      >
        <b>{ou.name}</b>
      </CustomTableCell>
    </TableRow>
  );
};

const OrgUnitValues = props => {
  const {
    formInfos,
    de,
    ou,
    index,
    dataElementCommonPrefix,
    dsi,
    classes
  } = props;

  const strippedStyle = {
    backgroundColor: index % 2 === 1 ? "rgba(120, 120, 120, 0.05)" : ""
  };
  const strippedStyle2 = {
    backgroundColor: index % 2 === 1 ? "rgba(120, 120, 120, 0.05)" : ""
  };

  const largeText = de.dataElement.valueType === "TEXT";
  return (
    <TableRow>
      <CustomTableCell />
      <CustomTableCell
        title={
          de.dataElement.name +
          " \n" +
          de.dataElement.code +
          " " +
          de.dataElement.id
        }
        style={strippedStyle}
      >
        <span>
          {de.dataElement.name.slice(
            dataElementCommonPrefix.length,
            de.dataElement.name.length
          )}
        </span>
        {de.dataElement.code === undefined && (
          <a
            target="_blank"
            href={
              Dhis2.url +
              "/dhis-web-maintenance/#/edit/dataElementSection/dataElement/" +
              de.dataElement.id
            }
          >
            <EditIcon width="2px" height="2px" />
          </a>
        )}
      </CustomTableCell>

      {dsi.periods.map(pe => {
        const key = [
          de.dataElement.id,
          pe,
          ou.id,
          de.categoryOptionCombo
            ? de.categoryOptionCombo.id
            : dsi.defaultCategoryCombo.categoryOptionCombos[0].id,
          de.categoryOptionCombo
            ? de.categoryOptionCombo.id
            : dsi.defaultCategoryCombo.categoryOptionCombos[0].id
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
                  backgroundColor: formInfos.valids[key] ? "#badbad" : ""
                }
              }}
            />
          </CustomTableCell>
        );
      })}
    </TableRow>
  );
};

const styles = theme => ({
  textField: {
    width: 100,
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  textLargeField: {
    width: 170,
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 10
  }
});

class IncentiveContainer extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this);
    this.state = { errors: {}, valids: {} };

    this.setDataValue = debounce(this.setDataValue, 500);
  }

  handleChange = (key, de, pe, ou) => async event => {
    console.log(
      de.dataElement.name + ", " + pe + " " + ou.name + " " + event.target.value
    );
    this.setState({
      indexedValues: { ...this.state.indexedValues, [key]: event.target.value }
    });

    const value = {
      de: de.dataElement.id,
      co: this.state.dataSetInfos.defaultCategoryCombo.categoryOptionCombos[0]
        .id,
      ds: this.state.dataSetInfos.dataSet.id,
      ou: ou.id,
      pe: pe,
      value: event.target.value
    };
    this.setDataValue(key, value);
  };

  setDataValue = async (key, value) => {
    try {
      await Dhis2.setDataValue(value);
      this.setState({ valids: { ...this.state.valids, [key]: true } });
      this.setState({ errors: { ...this.state.errors, [key]: undefined } });
    } catch (error) {
      this.setState({
        errors: { ...this.state.errors, [key]: error.message },
        valids: { ...this.state.valids, [key]: false }
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
      errors: {}
    });
    this.loadData();
  }

  async loadData() {
    if (this.props.currentUser === undefined) {
      return;
    }
    //TODO display also last changes : http://liberia.dhis2.org/dhis/api/audits/dataValue?ds=Ouqnlj54RY4&period=2017July&period=2018July
    try {
      const dataSet = await Dhis2.getDataSet(this.props.incentiveCode);
      const periods = IncentiveSupport.computePeriods(
        dataSet.periodType,
        this.props.period
      );
      const values = await Dhis2.getValues(
        this.props.currentUser,
        dataSet,
        periods
      );
      const defaultCategoryCombo = await Dhis2.getDefaultCategoryCombo();
      const indexedValues = {};

      dataSet.dataSetElements.sort(function(a, b) {
        var x = a.dataElement.code;
        var y = b.dataElement.code;
        return x < y ? -1 : x > y ? 1 : 0;
      });

      if (values.dataValues) {
        values.dataValues.forEach(dataValue => {
          const key = [
            dataValue.dataElement,
            dataValue.period,
            dataValue.orgUnit,
            dataValue.categoryOptionCombo,
            dataValue.attributeOptionCombo
          ];
          indexedValues[key] = dataValue.value;
        });
      }

      this.setState({
        indexedValues: indexedValues,
        dataSetInfos: {
          dataSet: dataSet,
          periods: periods,
          defaultCategoryCombo: defaultCategoryCombo.categoryCombos[0]
        }
      });
    } catch (error) {
      this.setState({
        error:
          "Sorry something went wrong, try refreshing or contact the support : " +
          error.message
      });
      throw error;
    }
  }

  render() {
    if (this.state.error !== undefined) {
      return (
        <React.Fragment>
          <IncentiveNavigationBar
            period={this.props.period}
            incentiveCode={this.props.incentiveCode}
            incentivesDescriptors={this.props.incentivesDescriptors}
          />
          <Warning message={this.state.error} />;
        </React.Fragment>
      );
    }
    if (
      this.state.dataSetInfos === undefined ||
      this.props.currentUser === undefined
    ) {
      return (
        <div>
          <IncentiveNavigationBar
            period={this.props.period}
            incentiveCode={this.props.incentiveCode}
            incentivesDescriptors={this.props.incentivesDescriptors}
          />
          <Typography>Incentives</Typography>
          <Loader />
        </div>
      );
    }
    const dsi = this.state.dataSetInfos;
    const { classes } = this.props;
    const dataElementCommonPrefix = IncentiveSupport.commonPrefix(
      dsi.dataSet.dataSetElements.map(de => de.dataElement.name)
    );
    const formInfos = {
      errors: this.state.errors,
      indexedValues: this.state.indexedValues,
      valids: this.state.valids
    };
    const allowedSeeOrgunitIds = Dhis2.allowedSeeOrgunits(
      this.props.currentUser,
      dsi.dataSet
    ).map(ou => ou.id);

    const nonAllowedSee = dsi.dataSet.organisationUnits.filter(
      ou => !allowedSeeOrgunitIds.includes(ou.id)
    );
    return (
      <React.Fragment>
        <IncentiveNavigationBar
          period={this.props.period}
          incentiveCode={this.props.incentiveCode}
          incentivesDescriptors={this.props.incentivesDescriptors}
        />

        <Paper className={classes.root}>
          <Typography variant="headline">{dsi.dataSet.name}</Typography>
          <br />
          <Table padding="none">
            <TableHead>
              <TableRow>
                <CustomTableCell>OrgUnit</CustomTableCell>
                <CustomTableCell>Data element</CustomTableCell>
                {dsi.periods.map(p => (
                  <CustomTableCell key={p}>{p}</CustomTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {dsi.dataSet.organisationUnits
                .filter(ou => allowedSeeOrgunitIds.includes(ou.id))
                .map(ou => {
                  return (
                    <React.Fragment>
                      <OrgUnitLine ou={ou} />
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
                        />
                      ))}
                    </React.Fragment>
                  );
                })}
            </TableBody>
          </Table>
          {nonAllowedSee.length > 1 && (
            <p>
              You are not allowed to see :{" "}
              {nonAllowedSee.map(ou => ou.name).join(", ")}
            </p>
          )}
        </Paper>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(IncentiveContainer);
