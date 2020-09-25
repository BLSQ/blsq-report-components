import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { withNamespaces } from "react-i18next";
import { Box, Popover, IconButton } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { Link } from "react-router-dom";

import tables from "../styles/tables";
import links from "../styles/links";
import icons from "../styles/icons";

const styles = (theme) => ({
  ...tables(theme),
  ...icons(theme),
  ...links(theme),
  typography: {
    padding: theme.spacing(2),
  },
  button: {
    position: "relative",
    top: -2,
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
});

const useStyles = makeStyles((theme) => styles(theme));

const checkNotVivibleOverlaps = (
  mainContracts,
  subContracts,
  allContracts,
  allContractsOverlaps,
) => {
  let warnings;
  subContracts.contracts.forEach((c) => {
    if (allContractsOverlaps[c.id]) {
      allContractsOverlaps[c.id].forEach((contractOverlapId) => {
        if (
          !mainContracts.contracts.find((mc) => mc.id === contractOverlapId) &&
          !subContracts.contracts.find((sc) => sc.id === contractOverlapId)
        ) {
          const notVisibleContract = allContracts.find(
            (c) => c.id === contractOverlapId,
          );
          if (!warnings) {
            warnings = {};
          }
          if (notVisibleContract) {
            warnings[c.id] = warnings[c.id]
              ? [...warnings[c.id], notVisibleContract]
              : [notVisibleContract];
          }
        }
      });
    }
  });
  return warnings;
};

const ContractsNotVisibleOverlaps = ({
  mainContracts,
  subContracts,
  t,
  allContracts,
  allContractsOverlaps,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const notVivibleOverlaps = checkNotVivibleOverlaps(
    mainContracts,
    subContracts,
    allContracts,
    allContractsOverlaps,
  );

  return (
    <Box>
      {Object.keys(notVivibleOverlaps).map((contractId) => {
        const currentContract = allContracts.find((c) => c.id === contractId);
        if (!currentContract || (currentContract && !currentContract.rowIndex))
          return null;
        return (
          <Box key={currentContract.id}>
            <span className={classes.warningIcon}>⚠️</span>
            {t("contracts.subContractNotVisibleOverlap", {
              rowIndex: currentContract.rowIndex,
              count: notVivibleOverlaps[currentContract.id].length,
            })}
            <IconButton
              onClick={handleClick}
              size="small"
              disableRipple
              disableFocusRipple
              className={classes.button}
            >
              <InfoIcon color="action" />
            </IconButton>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
            >
              {notVivibleOverlaps[currentContract.id].map((c) => (
                <Box p={2}>
                  <Link
                    to={`/contracts/${
                      c.fieldValues.contract_main_orgunit
                        ? c.fieldValues.contract_main_orgunit
                        : c.orgUnit.id
                    }`}
                    className={classes.link}
                  >
                    {`${c.orgUnit.name}, id: ${c.id}`}
                  </Link>
                </Box>
              ))}
            </Popover>
          </Box>
        );
      })}
    </Box>
  );
};

ContractsNotVisibleOverlaps.propTypes = {
  allContracts: PropTypes.array.isRequired,
  t: PropTypes.func.isRequired,
  subContracts: PropTypes.object.isRequired,
  mainContracts: PropTypes.object.isRequired,
  allContractsOverlaps: PropTypes.object.isRequired,
};

export default withNamespaces()(ContractsNotVisibleOverlaps);
