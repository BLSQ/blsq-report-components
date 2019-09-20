import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import { withNamespaces } from "react-i18next";

const styles = theme => ({
  formControl: {
    minWidth: 400
  }
});

class OuPicker extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.onOuSearchChange(event);
  }

  render() {
    const classes = this.props.classes;
    return (
      <TextField
        autoFocus
        label={this.props.t("orgUnit_name")}
        InputLabelProps={{ shrink: true }}
        onChange={this.handleChange}
        value= {this.props.ouSearchValue}
        margin="normal"
        className={classes.formControl}
      />
    );
  }
}

OuPicker.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(withNamespaces()(OuPicker));
