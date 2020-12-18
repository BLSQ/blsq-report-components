import React, { Component } from "react";
import debounce from "lodash/debounce";
import { makeStyles } from "@material-ui/core/styles";

import TextField from "@material-ui/core/TextField";
import EditIcon from "@material-ui/icons/Edit";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";

import IncentiveNavigationBar from "./IncentiveNavigationBar";
import IncentiveSupport from "./IncentiveSupport";
import Loader from "../shared/Loader";
import Warning from "../shared/Warning";
import DatePeriods from "../../support/DatePeriods";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { IconButton, Button } from "@material-ui/core";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
const CustomTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: "#266696",
    color: theme.palette.common.white,
    textAlign: "center",
    fontWeight: "bold",
    padding: "5px",
    fontSize: "14px",
  },
  root: {
    textAlign: "left",
    align: "center",
  },
}))(TableCell);

const useStyles = makeStyles({});

const CopyValuesDialogButton = (props) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [fromPeriod, setFromPeriod] = React.useState(undefined);
  const { fromPeriods, toPeriod, orgUnit, dsi, dhis2 } = props;

  const handleClose = () => {
    setOpen(false);
  };

  const handleCopy = async () => {
    setOpen(false);
    const dataSetId = dsi.dataSet.id;
    alert(`Copying '${dsi.dataSet.name}' from ${fromPeriod} to ${toPeriod} for ${orgUnit.name}`);
    const api = await dhis2.api();
    const ou = await api.get("dataValueSets", {
      dataSet: dataSetId,
      period: [fromPeriod],
      orgUnit: orgUnit.id,
      paging: false,
    });
    const targetValues = [];
    for (let dv of ou.dataValues) {
      targetValues.push({ ...dv, period: toPeriod });
    }
    const resp = await api.post("dataValueSets", {
      dataSet: dataSetId,
      dataValues: targetValues,
    });
    window.location.reload(true);
  };

  const handleListItemClick = (value) => {
    setFromPeriod(value);
  };

  return (
    <CustomTableCell style={{ backgroundColor: "lightGrey", color: "white", textAlign: "center" }}>
      <IconButton onClick={() => setOpen(true)}>
        <FileCopyIcon />
      </IconButton>
      <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
        <DialogTitle id="simple-dialog-title">Copy data from period</DialogTitle>
        <List>
          {fromPeriods.map((period) => (
            <ListItem button onClick={() => handleListItemClick(period)} key={period} selected={period === fromPeriod}>
              <ListItemText primary={period} />
            </ListItem>
          ))}
        </List>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCopy} color="primary" autoFocus>
            Copy {fromPeriod && <span>&nbsp;from {fromPeriod} !</span>}
          </Button>
        </DialogActions>
      </Dialog>
    </CustomTableCell>
  );
};

const orgunitLineStyle = {
  backgroundColor: "lightGrey",
  textAlign: "left",
  fontSize: 14,
};

const OrgUnitLine = (props) => {
  const { ou, dsi, dhis2 } = props;
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
        ></CopyValuesDialogButton>
      ))}
    </TableRow>
  );
};

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

      dataSet.dataSetElements.sort(function (a, b) {
        var x = a.dataElement.code;
        var y = b.dataElement.code;
        return x < y ? -1 : x > y ? 1 : 0;
      });

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
    if (this.state.dataSetInfos === undefined || this.props.currentUser === undefined) {
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
    const { classes, dhis2 } = this.props;
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
                      <OrgUnitLine ou={ou} dsi={dsi} dhis2={this.props.dhis2} />
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
        </Paper>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(IncentiveContainer);
