
import React from "react";
import Chip from "@material-ui/core/Chip";
import {
    IconButton,
    Tooltip,
} from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';

import { Link } from "react-router-dom";
import { defaultOptions } from '../../support/table';
import { getOverlaps } from "./utils";

export const contractsColumns = (t, classes) => [
    {
     name: "id",
     label: "ID",
     options: {
      filter: false,
      sort: false,
      style: {
          color: 'red',
      }
     }
    },
    {
     name: "orgUnit.name",
     label: t('orgUnit_name'),
     options: {
      filter: false,
      sort: true,
     }
    },
    {
     name: "codes",
     label: t('codes'),
     options: {
      filter: true,
      sort: true,
      customBodyRender: (codes, tableMeta, updateValue) => (codes.map((code) => (
        <Chip key={code} label={code}  className={classes.chip} />
       )))
     },
    },
    {
     name: "startPeriod",
     label: t('start_period'),
     options: {
      filter: true,
      sort: true,
     }
    },
    {
     name: "endPeriod",
     label: t('end_period'),
     options: {
      filter: true,
      sort: true,
     }
    },
    {
     name: "orgUnit.id",
     label: t('table.actions.title'),
     options: {
      filter: false,
      sort: false,
      customBodyRender: (orgUnitId, tableMeta, updateValue) => (
        <Tooltip
          placement="bottom"
          title={t('table.actions.see')}
          arrow
         >
          <span>
            <IconButton>
              <Link to={`/contracts/${orgUnitId}`} className={classes.iconLink}>
                <Visibility />
              </Link>
            </IconButton>
          </span>
        </Tooltip>
      )
     },
    },
   ];

export const contractsOptions = (t, contracts, contractsById, contractsOverlaps, classes) => ({
    ...defaultOptions(t),
    search: false,
    filter: false,
    setRowProps: (row, dataIndex, rowIndex) => {
        const contract = contracts[dataIndex]
        const isOverlaping = getOverlaps(contract.id, contractsOverlaps, contractsById).length > 0
      return {
        className: isOverlaping ? classes.rowError : '',
      };
    },
})
