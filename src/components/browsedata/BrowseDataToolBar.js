import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import ArrowForward from "@material-ui/icons/ArrowForward";
import ArrowBack from "@material-ui/icons/ArrowBack";
import DatePeriods from "../../support/DatePeriods";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

const styles = {
  center: {
    textAlign: "center"
  },
  formControl: {
    minWidth: "50%"
  }
};

class InvoiceToolBar extends Component {
  constructor(props) {
    super(props);
    this.recalculateInvoice = this.recalculateInvoice.bind(this);
    this.state = {
      open: false
    };
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleConfirm = () => {
    this.setState({ open: false });
    this.recalculateInvoice();
  };

  async recalculateInvoice() {
    this.props.onRecalculate();
  }

  render() {
    const {
      classes,
      period,
      orgUnitId,
      dataElementGroupId,
      dataElementGroups
    } = this.props;

    const nextPeriod = DatePeriods.next(period);
    const next =
      "/data/" +
      nextPeriod +
      "/deg/" +
      dataElementGroupId +
      "/" +
      orgUnitId +
      "/children";

    const previousPeriod = DatePeriods.previous(period);
    const previous =
      "/data/" +
      previousPeriod +
      "/deg/" +
      dataElementGroupId +
      "/" +
      orgUnitId +
      "/children";

    return (
      <div className={classes.center + " no-print"}>
        <FormControl className={classes.formControl}>
          <Select
            value={dataElementGroupId}
            onChange={this.handleChange}
            autoWidth={true}
          >
            {dataElementGroups.map(group => (
              <MenuItem
                key={group.id}
                component={Link}
                value={group.id}
                to={
                  "/data/" +
                  period +
                  "/deg/" +
                  group.id +
                  "/" +
                  orgUnitId +
                  "/children"
                }
              >
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          component={Link}
          to={previous}
          title={"Previous period : " + previousPeriod}
        >
          <ArrowBack />
        </Button>
        &nbsp;
        <span title={period}>
          {DatePeriods.displayName(
            period,
            this.props.periodFormat[DatePeriods.detect(period)]
          )}
        </span>
        &nbsp;
        <Button
          component={Link}
          to={next}
          title={"Next period : " + nextPeriod}
        >
          <ArrowForward />
        </Button>
      </div>
    );
  }
}

export default withStyles(styles)(InvoiceToolBar);
