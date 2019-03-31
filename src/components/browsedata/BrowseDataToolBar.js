import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import ArrowForward from "@material-ui/icons/ArrowForward";
import ArrowBack from "@material-ui/icons/ArrowBack";
import DatePeriods from "../../support/DatePeriods";

import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

const styles = {
  center: {
    textAlign: "center"
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

    const next =
      "/data/" +
      DatePeriods.next(period) +
      "/deg/" +
      dataElementGroupId +
      "/" +
      orgUnitId +
      "/children";

    const previous =
      "/data/" +
      DatePeriods.previous(period) +
      "/deg/" +
      dataElementGroupId +
      "/" +
      orgUnitId +
      "/children";

    return (
      <div className={classes.center + " no-print"}>
        <Select value={dataElementGroupId} onChange={this.handleChange}>
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
        <Button component={Link} to={previous}>
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
        <Button component={Link} to={next}>
          <ArrowForward />
        </Button>
      </div>
    );
  }
}

export default withStyles(styles)(InvoiceToolBar);
