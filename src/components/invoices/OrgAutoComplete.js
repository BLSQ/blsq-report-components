import React from "react";
import PropTypes from "prop-types";
import deburr from "lodash/deburr";
import Autosuggest from "react-autosuggest";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import { withStyles } from "@material-ui/core/styles";

function renderInputComponent(inputProps) {
  const { classes, inputRef = () => {}, ref, ...other } = inputProps;

  return (
    <TextField
      InputProps={{
        inputRef: node => {
          ref(node);
          inputRef(node);
        },
        classes: {
          input: classes.input
        }
      }}
      {...other}
    />
  );
}

const full_name = suggestion =>
  suggestion.ancestors.map(ou => ou.name).join(" > ");

function renderSuggestion(suggestion, { query, isHighlighted }) {
  const matches = match(suggestion.name, query);
  const parts = parse(suggestion.name, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part, index) =>
          part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 500 }}>
              {part.text}
            </span>
          ) : (
            <strong key={String(index)} style={{ fontWeight: 300 }}>
              {part.text}
            </strong>
          )
        )}
        <br />
        &nbsp;&nbsp;&nbsp;
        <small style={{ fontWeight: 10 }}>{full_name(suggestion)}</small>
      </div>
    </MenuItem>
  );
}

function getSuggestions(value, suggestions) {
  const inputValue = deburr(value.trim()).toLowerCase();
  const inputLength = inputValue.length;
  let count = 0;

  if (suggestions === undefined) {
    return [];
  }

  const organisationUnits = suggestions.organisationUnits;

  organisationUnits.forEach(ou => {
    if (ou.searchString === undefined) {
      ou.searchString = deburr(ou.name).toLowerCase();
    }
  });

  return inputLength === 0
    ? suggestions
    : organisationUnits.filter(suggestion => {
        const keep = count < 5 && suggestion.searchString.includes(inputValue);

        if (keep) {
          count += 1;
        }

        return keep;
      });
}

function getSuggestionValue(suggestion) {
  return full_name(suggestion);
}

const styles = theme => ({
  root: {
    height: 50,
    flexGrow: 1
  },
  container: {
    position: "relative"
  },
  suggestionsContainerOpen: {
    position: "absolute",
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0
  },
  suggestion: {
    display: "block"
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    maxWidth: 625,
    listStyleType: "none"
  },
  divider: {
    height: theme.spacing.unit * 2
  },
  input: {
    minWidth: 625
  }
});

class OrgAutoComplete extends React.Component {
  state = {
    single: "",
    popper: "",
    suggestions: []
  };

  handleSuggestionSelected = (
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
  ) => {
    console.log("handleSuggestionSelected", JSON.stringify(suggestion));
  };

  handleSuggestionsFetchRequested = ({ value }) => {
    const orgunits = this.props.organisationUnits;
    this.setState({
      suggestions: getSuggestions(value, orgunits)
    });
  };

  handleSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  handleChange = name => (event, { newValue }) => {
    this.setState({
      [name]: newValue
    });
  };

  render() {
    const { classes, organisationUnits } = this.props;
    const autosuggestProps = {
      renderInputComponent,
      suggestions: this.state.suggestions,
      onSuggestionsFetchRequested: this.handleSuggestionsFetchRequested,
      onSuggestionsClearRequested: this.handleSuggestionsClearRequested,
      getSuggestionValue,
      renderSuggestion,
      onSuggestionSelected: this.handleSuggestionSelected
    };

    return (
      <div className={classes.root}>
        <Autosuggest
          clearable={true}
          {...autosuggestProps}
          inputProps={{
            label: "Limit to organisation units under of",
            classes,
            placeholder: "Limit the query to organisation units under : ",
            value: this.state.single,
            onChange: this.handleChange("single")
          }}
          theme={{
            container: classes.container,
            suggestionsContainerOpen: classes.suggestionsContainerOpen,
            suggestionsList: classes.suggestionsList,
            suggestion: classes.suggestion
          }}
          renderSuggestionsContainer={options => (
            <Paper {...options.containerProps} square>
              {options.children}
            </Paper>
          )}
        />
      </div>
    );
  }
}

OrgAutoComplete.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(OrgAutoComplete);
