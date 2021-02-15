import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { withTranslation } from "react-i18next";
import debounce from "lodash/debounce";
import {
  makeStyles,
  Tooltip,
  FormControl,
  TextField,
  ClickAwayListener,
  Typography,
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
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  autoComplete: {
    width: `calc(100% - ${theme.spacing(2)}px)`,
  },
  tooltip: {
    margin: theme.spacing(2, 0, 0, 1),
  },
});
const useStyles = makeStyles((theme) => styles(theme));

const OuSearch = ({ t, orgUnit, onChange, label, defaultValue }) => {
  const classes = useStyles();
  const currentUser = useSelector((state) => state.currentUser.profile);
  const dhis2 = useSelector((state) => state.dhis2.support);
  const [selectedOrgUnit, setSelectedOrgUnit] = React.useState(orgUnit)
  const [searchValue, setSearchValue] = React.useState("");
  const [options, setOptions] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchTriggered, setSearchTriggered] = React.useState(false);

  React.useEffect(() => {
    const loadOrgUnitById = async () => {

      if (defaultValue != "" && defaultValue != undefined && orgUnit == undefined) {
        const api = await dhis2.api()
        const org = await api.get("organisationUnits/" + defaultValue, { fields: "[*],ancestors[id,name],organisationUnitGroups[id,name,code]" })
        if (org) {
          setSelectedOrgUnit(org)
          setSearchValue(org.name);
          onChange(org)
        }
      } else {
        setSelectedOrgUnit(orgUnit)
        setSearchValue("")
      }

    }
    loadOrgUnitById();
  }, [defaultValue])

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
    if (
      orgUnit &&
      !orgUnitsResp.organisationUnits.find((o) => o.id === orgUnit.id)
    ) {
      orgUnitsResp.organisationUnits.push(orgUnit);
    }
    setOptions(orgUnitsResp.organisationUnits);
  };

  const handleInputChange = (newvalue) => {
    setSearchValue(newvalue);
    if ((!orgUnit || newvalue !== orgUnit.name) && newvalue.length >= minChar) {
      if (!searchTriggered) {
        setSearchTriggered(true);
      }
      setIsLoading(true);
      setOptions([]);
      debouncedSearchOu(newvalue);
    }
  };

  const handleSelect = (newOrgUnit) => {
    setSelectedOrgUnit(newOrgUnit)
    setSearchValue(newOrgUnit ? newOrgUnit.name : "")
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
          value={selectedOrgUnit}
          defaultValue={defaultValue}
          open={searchTriggered}
          loading={isLoading}
          getOptionSelected={(option, value) => value && value.id === option.id}
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
          renderOption={(option) => (
            <div>
              <span display="block">{option.name} <code style={{ color: "lightgrey" }}>{option.id}</code></span>
              <pre style={{ fontSize: "8px" }}>{option.ancestors.slice(1).map(o => o.name).join(' > ')}</pre>
              <hr></hr>
            </div>)
          }
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                autoFocus
                label={label || t("orgUnit")}
                onKeyUp={(event) => {
                  if (event.key === "Escape") {
                    setSearchTriggered(false);
                  }
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                placeholder=""
              />
            )
          }}
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
  label: null,
};

OuSearch.propTypes = {
  t: PropTypes.func.isRequired,
  orgUnit: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};

export default withTranslation()(OuSearch);
