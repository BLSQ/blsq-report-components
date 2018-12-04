import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import DatePeriods from "../../support/DatePeriods";

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  }
});

class PeriodPicker extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.onPeriodChange(event.target.value);
  }

  render() {
    const classes = this.props.classes;
    const period = this.props.period;
    const periods = this.buildPeriods(period);
    return (
      <FormControl className={classes.formControl}>
        <InputLabel>Period</InputLabel>
        <Select
          value={this.props.period}
          onChange={this.handleChange}
          title={this.props.period}
        >
          {periods.map(dhis2period => (
            <MenuItem key={dhis2period} value={dhis2period} title={dhis2period}>
              {DatePeriods.displayName(dhis2period, this.props.periodFormat)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  buildPeriods(period) {
    const nextPeriod = DatePeriods.nextQuarter(period);
    const nextPeriod2 = DatePeriods.nextQuarter(nextPeriod);
    const previous = DatePeriods.previousQuarter(period);
    const previous2 = DatePeriods.previousQuarter(previous);
    const previous3 = DatePeriods.previousQuarter(previous2);
    const previous4 = DatePeriods.previousQuarter(previous3);
    const previous5 = DatePeriods.previousQuarter(previous4);
    return [
      previous5,
      previous4,
      previous3,
      previous2,
      previous,
      period,
      nextPeriod,
      nextPeriod2
    ];
  }
}

PeriodPicker.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PeriodPicker);
