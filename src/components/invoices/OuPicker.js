import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

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
        label="Organisation Unit name"
        InputLabelProps={{ shrink: true }}
        onChange={this.handleChange}
        margin="normal"
        value={this.props.ouSearchValue}
        className={classes.formControl}
      />
    );
  }
}

OuPicker.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(OuPicker);
