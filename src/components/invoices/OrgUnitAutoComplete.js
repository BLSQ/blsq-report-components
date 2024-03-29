/* eslint-disable react/prop-types, react/jsx-handler-names */

import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import { withTranslation } from "react-i18next";

const full_name = (suggestion) => {
  const ancestorsWithoutCountry = suggestion.ancestors
    .slice(1)
    .map((ou) => ou.name);
  ancestorsWithoutCountry.push(suggestion.name);
  return ancestorsWithoutCountry.join(" > ");
};

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    height: 40,
  },
  input: {
    display: "flex",
    width: "700px",
    padding: 0,
    margin: "5px",
  },
  valueContainer: {
    display: "flex",
    flexWrap: "wrap",
    flex: 1,
    alignItems: "center",
    overflow: "hidden",
  },
  noOptionsMessage: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: "absolute",
    left: 2,
    fontSize: 16,
  },
  paper: {
    position: "absolute",
    maxWidth: "630px",
    zIndex: 1,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0,
  },
  divider: {
    height: theme.spacing(2),
  },
});

function NoOptionsMessage(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
  return (
    <TextField
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

function Option(props) {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

function Placeholder(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.placeholder}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function SingleValue(props) {
  return (
    <Typography
      className={props.selectProps.classes.singleValue}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function ValueContainer(props) {
  return (
    <div className={props.selectProps.classes.valueContainer}>
      {props.children}
    </div>
  );
}

function Menu(props) {
  return (
    <Paper
      square
      className={props.selectProps.classes.paper}
      {...props.innerProps}
    >
      {props.children}
    </Paper>
  );
}

const components = {
  Control,
  Menu,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer,
};

class IntegrationReactSelect extends React.Component {
  handleChange = (name) => (value) => {
    this.props.onChange(value ? value.orgUnit.id : undefined);
  };

  render() {
    const { classes, theme, organisationUnits } = this.props;
    if (organisationUnits && organisationUnits.organisationUnits) {
      organisationUnits.organisationUnits.sort((a, b) => {
        return a.path.localeCompare(b.path);
      });
    }

    const options =
      organisationUnits && organisationUnits.organisationUnits
        ? organisationUnits.organisationUnits.map((ou) => ({
            value: ou.id,
            label: full_name(ou),
            orgUnit: ou,
          }))
        : [];
    const selectStyles = {
      input: (base) => ({
        ...base,
        color: theme.palette.text.primary,
        "& input": {
          font: "inherit",
        },
      }),
    };

    const selected = this.props.selected
      ? options.find((ou) => ou.value === this.props.selected)
      : undefined;

    return (
      <div className={classes.root}>
        <Select
          classes={classes}
          styles={selectStyles}
          textFieldProps={{
            label: this.props.t("limit_org_unit_under"),
            InputLabelProps: {
              shrink: true,
            },
          }}
          options={options}
          components={components}
          value={selected}
          onChange={this.handleChange("single")}
          placeholder={this.props.t("search_org_unit")}
          isClearable
        />
      </div>
    );
  }
}

IntegrationReactSelect.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(
  withTranslation()(IntegrationReactSelect),
);
