import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { withNamespaces } from "react-i18next";
import debounce from "lodash/debounce";
import {
  makeStyles,
  Tooltip,
  FormControl,
  TextField,
  ClickAwayListener,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import InfoIcon from "@material-ui/icons/Info";
import LoadingSpinner from "../shared/LoadingSpinner";

const minChar = 3;
const maxResult = 100;

const styles = (theme) => ({
  formControl: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  autoComplete: {
    width: `calc(100% - ${theme.spacing(2)}px)`,
  },
  tooltip: {
    margin: theme.spacing(2, 0, 0, 1),
  },
});
const useStyles = makeStyles((theme) => styles(theme));

const OuSearch = ({ t, orgUnit, onChange }) => {
  const classes = useStyles();
  const currentUser = useSelector((state) => state.currentUser.profile);
  const dhis2 = useSelector((state) => state.dhis2.support);
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
    if (!orgUnitsResp.organisationUnits.find((o) => o.id === orgUnit.id)) {
      orgUnitsResp.organisationUnits.push(orgUnit);
    }
    setOptions(orgUnitsResp.organisationUnits);
  };

  const handleInputChange = (newvalue) => {
    setSearchValue(newvalue);
    if (newvalue !== orgUnit.name && newvalue.length >= minChar) {
      if (!searchTriggered) {
        setSearchTriggered(true);
      }
      setIsLoading(true);
      setOptions([]);
      debouncedSearchOu(newvalue);
    }
  };

  const handleSelect = (newOrgUnit) => {
    setSearchTriggered(false);
    onChange(newOrgUnit);
  };
  return (
    <ClickAwayListener onClickAway={() => setSearchTriggered(false)}>
      <FormControl className={classes.formControl}>
        <Autocomplete
          clearOnEscape
          noOptionsText={t("noResult")}
          multiple={false}
          options={options === [] && Boolean(orgUnit) ? [orgUnit] : options}
          value={orgUnit}
          open={searchTriggered}
          loading={isLoading}
          getOptionSelected={(option, value) => value.id === option.id}
          className={classes.autoComplete}
          filterSelectedOptions
          popupIcon={null}
          loadingText={<LoadingSpinner fixed={false} padding={20} />}
          getOptionLabel={(option) => {
            return option ? option.name : "";
          }}
          onInputChange={(event, newInputValue) =>
            handleInputChange(newInputValue)
          }
          onChange={(event, newValue) => handleSelect(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              autoFocus
              label={t("orgUnit_name")}
              onKeyUp={(event) => {
                if (event.key === "Escape") {
                  setSearchTriggered(false);
                }
              }}
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
    </ClickAwayListener>
  );
};
OuSearch.defaultProps = {
  orgUnit: null,
};

OuSearch.propTypes = {
  t: PropTypes.func.isRequired,
  orgUnit: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

export default withNamespaces()(OuSearch);
