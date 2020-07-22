import React from "react";
import PropTypes from "prop-types";
import { withNamespaces } from "react-i18next";

import {
    FormControl,
    Input,
    InputAdornment,
    Box,
    Grid,
    Button,
    Tooltip,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";

const ContractFilters = ({filter, setFilter, t}) => {
  const [search, setSearch] = React.useState(undefined);
  const handleKeyPressed = (e) => {
    if (e.key === 'Enter') {
      setFilter(search)
      e.preventDefault();
    }
  }
  return (
    <Box mb={3}>
      <Grid container item xs={12}>
        <Grid item xs={12} md={4}>
          <FormControl>
            <Input
              id="input-with-icon-adornment"
              fullWidth={true}
              onKeyPress={(e) => handleKeyPressed(e)}
              startAdornment={
                <InputAdornment position="end">
                  <Tooltip
                    arrow
                    title={t('contracts.searchInfos')}
                    >
                    <SearchIcon />
                  </Tooltip>
                </InputAdornment>
            }
              value={search}
              onChange={(event) => setSearch(event.target.value)}
          />
          </FormControl>
        </Grid>
      </Grid>
      <Grid container item xs={12} justify="flex-end">
        <Button
          onClick={() => setFilter(search)}
          color="primary"
          variant="contained"
          disabled={false}
      >
          {t('filter')}
        </Button>
      </Grid>
    </Box>
  );
};

ContractFilters.defaultProps = {
    filter: '',
  };

ContractFilters.propTypes = {
    filter: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  };

export default withNamespaces()(ContractFilters);
