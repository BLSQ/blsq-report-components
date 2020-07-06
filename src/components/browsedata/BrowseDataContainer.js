import React, { Component } from "react";

import { withStyles } from "@material-ui/core/styles";

import BrowseDataToolBar from "./BrowseDataToolBar";
import Cell from "../shared/Cell";

import Loader from "../shared/Loader";

const styles = {
  table: {
    borderCollapse: "collapse",
    fontSize: "0.7500rem",
    padding: "0px 3px 3px 3px",
    overflowX: "scroll"
  },
  th: {
    borderCollapse: "collapse",
    padding: "0px 3px 0px 0px",
    border: "0.5pt solid black"
  }
};

const dataElementsComparator = (a, b) => {
  return a.name.localeCompare(b.name, undefined, {
    numeric: true,
    sensitivity: "base"
  });
};

const orgUnitComparator = (a, b) => {
  var c1 = a.ancestors[1] ? a.ancestors[1].name : "";
  var c2 = b.ancestors[1] ? b.ancestors[1].name : "";

  var d1 = a.ancestors[2] ? a.ancestors[2].name : "";
  var d2 = b.ancestors[2] ? b.ancestors[2].name : "";

  var n1 = a.name;
  var n2 = b.name;

  if (c1 < c2) return -1;
  if (c1 > c2) return 1;

  if (d1 < d2) return -1;
  if (d1 > d2) return 1;

  if (n1 < n2) return -1;
  if (n1 > n2) return 1;

  return 0;
};

class BrowseDataContainer extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this);
    this.state = {};
  }

  async componentDidMount() {
    this.loadData();
    this.mounted = true;
  }

  async componentWillReceiveProps(nextProps) {
    this.props = nextProps;
    this.setState({
      date: new Date(),
      data: undefined,
      error: undefined
    });
    this.loadData();
  }

  async loadData() {
    if (this.props.currentUser === undefined) {
      return;
    }

    try {
      const dataElementGroup = await this.props.dhis2.getDataElementGroup(
        this.props.dataElementGroupId
      );

      const dataElementGroupValues = await this.props.dhis2.getDataElementGroupValues(
        this.props.orgUnitId,
        this.props.dataElementGroupId,
        [this.props.period]
      );

      const values = (dataElementGroupValues.dataValues || []).filter(
        v => v.value
      );

      const dataElements = dataElementGroup.dataElements;
      dataElements.sort(dataElementsComparator);
      const orgUnitIds = values.map(val => val.orgUnit);

      const orgUnitResponses = await this.props.dhis2.getOrgUnitsUnder(
        this.props.orgUnitId
      );
      const orgUnits = orgUnitResponses.organisationUnits.filter(ou =>
        orgUnitIds.includes(ou.id)
      );
      orgUnits.sort(orgUnitComparator);
      const indexedValues = {};
      if (dataElementGroupValues.dataValues) {
        dataElementGroupValues.dataValues.forEach(dataValue => {
          const key = [
            dataValue.dataElement,
            dataValue.period,
            dataValue.orgUnit
          ];
          indexedValues[key] = dataValue.value;
        });
      }

      const columns = [
        "Org Unit id",
        this.props.levels[1],
        this.props.levels[2],
        "Org Unit"
      ];

      dataElements.forEach(de => {
        columns.push(de.name);
      });
      const xlsdata = orgUnits.map(ou => {
        let row = [
          ou.id,
          ou.ancestors[1] ? ou.ancestors[1].name : "",
          ou.ancestors[2] ? ou.ancestors[2].name : "",
          ou.name
        ];
        dataElements.forEach(de => {
          row.push(indexedValues[[de.id, this.props.period, ou.id]]);
        });
        return row;
      });

      this.setState({
        data: {
          dataElementGroup,
          indexedValues,
          dataElements,
          orgUnits,
          xlsdata: {
            columns: columns,
            data: xlsdata
          }
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
    const navigation = this.props.dataElementGroups && (
      <BrowseDataToolBar
        period={this.props.period}
        dataElementGroups={this.props.dataElementGroups}
        dataElementGroupId={this.props.dataElementGroupId}
        orgUnitId={this.props.orgUnitId}
        periodFormat={this.props.periodFormat}
        xlsdata={this.state.data ? this.state.data.xlsdata : undefined}
      />
    );

    if (this.state.data == undefined) {
      return (
        <div>
          {navigation}
          <Loader>Loading</Loader>
        </div>
      );
    }
    if (this.state.error !== undefined) {
      return <Warning message={this.state.error} />;
    }

    const classes = this.props.classes;
    const { dataElements, orgUnits, indexedValues } = this.state.data;

    return (
      <div>
        {navigation}
        <table className={classes.table}>
          <thead>
            <tr>
              <th>{this.props.levels[1]}</th>
              <th>{this.props.levels[2]}</th>
              <th>Org Unit</th>
              {dataElements.map(de => (
                <th key={de.name}>{de.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orgUnits.map(ou => (
              <tr key={ou.id}>
                <td>{ou.ancestors[1] && ou.ancestors[1].name}</td>
                <td>{ou.ancestors[2] && ou.ancestors[2].name}</td>
                <td>{ou.name}</td>
                {dataElements.map(de => {
                  const rawValue =
                    indexedValues[[de.id, this.props.period, ou.id]];
                  const val = {
                    sample: {
                      code: de.id,
                      name: de.name,
                      period: this.props.period,
                      value:
                        rawValue == undefined ? undefined : Number(rawValue)
                    }
                  };
                  return (
                    <Cell
                      key={ou.id + de.name}
                      value={val}
                      field="sample"
                      variant="percentage"
                      width="5%"
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <br />
          <br />
          <br />
        </div>
        <p>{orgUnits.length} org units</p>
      </div>
    );
  }
}

export default withStyles(styles)(BrowseDataContainer);
