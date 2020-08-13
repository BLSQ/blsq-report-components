import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { withNamespaces } from "react-i18next";
import debounce from "lodash/debounce";
import { makeStyles, Tooltip, FormControl, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import InfoIcon from "@material-ui/icons/Info";
import LoadingSpinner from "../shared/LoadingSpinner";

const minChar = 3;
const maxResult = 100;

const styles = (theme) => ({
  formControl: {
    width: "100%",
    marginBottom: theme.spacing(),
    flexDirection: "row",
    alignItems: "center",
  },
  autoComplete: {
    width: `calc(100% - ${theme.spacing(2)}px)`,
  },
  tooltip: {
    margin: theme.spacing(2, 0, 0, 1),
  },
});
const useStyles = makeStyles((theme) => styles(theme));

const OuSearch = ({ t, dhis2, orgUnit }) => {
  const classes = useStyles();
  const currentUser = useSelector((state) => state.currentUser.profile);
  console.log("currentUser", currentUser);
  const [searchValue, setSearchValue] = React.useState("");
  const [options, setOptions] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchTriggered, setSearchTriggered] = React.useState(false);

  const [debouncedSearchOu] = React.useState(() =>
    debounce((search) => {
      searchOu(search);
    }, 1500),
  );
  const searchOu = async (searchValue) => {
    setIsLoading(true);
    const orgUnitsResp = await dhis2.searchOrgunits(
      searchValue,
      currentUser,
      null,
      null,
      maxResult,
    );
    setIsLoading(false);
    setOptions(orgUnitsResp.organisationUnits);
  };

  const handleChange = (newvalue) => {
    setSearchValue(newvalue);
    if (newvalue.length > minChar) {
      if (!searchTriggered) {
        setSearchTriggered(true);
      }
      setIsLoading(true);
      setOptions([]);
      debouncedSearchOu(newvalue);
    }
  };

  return (
    <FormControl className={classes.formControl}>
      <Autocomplete
        noOptionsText={t("noResult")}
        multiple={false}
        options={options}
        value={orgUnit}
        open={searchTriggered}
        loading={isLoading}
        className={classes.autoComplete}
        filterSelectedOptions
        loadingText={<LoadingSpinner fixed={false} padding={20} />}
        getOptionLabel={(option) => {
          return option ? option.name : "";
        }}
        onInputChange={(event, newInputValue) => handleChange(newInputValue)}
        onChange={(event, newValue) => {
          console.log("newValue", newValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            autoFocus
            label={t("orgUnit_name")}
            InputLabelProps={{
              shrink: Boolean(searchValue && searchValue !== ""),
            }}
            placeholder=""
          />
        )}
      />
      <span className={classes.tooltip}>
        <Tooltip arrow title={t("searchHelp", { minChar, maxResult })}>
          <InfoIcon color="action" />
        </Tooltip>
      </span>
    </FormControl>
  );
};
OuSearch.defaultProps = {
  orgUnit: null,
};

OuSearch.propTypes = {
  t: PropTypes.func.isRequired,
  dhis2: PropTypes.object.isRequired,
  orgUnit: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

export default withNamespaces()(OuSearch);
