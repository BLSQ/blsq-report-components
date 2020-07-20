
import React from "react";
import Chip from "@material-ui/core/Chip";
import {
    IconButton,
    Tooltip,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';

import { Link } from "react-router-dom";
import { defaultOptions } from '../../support/table';
import { getOverlaps } from "./utils";

export const contractsColumns = (t) => [
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
        <Chip key={code} label={code} />
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
     label: t('actions'),
     options: {
      filter: false,
      sort: false,
      customBodyRender: (orgUnitId, tableMeta, updateValue) => (
        <Tooltip
          placement="bottom"
          title={t('edit')}
          arrow
         >
          <span>
            <IconButton>
              <Link to={`/contracts/${orgUnitId}`}>
                <EditIcon color="primary" />
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
    setRowProps: (row, dataIndex, rowIndex) => {
        const contract = contracts[dataIndex]
        const isOverlaping = getOverlaps(contract.id, contractsOverlaps, contractsById).length > 0
      return {
        className: isOverlaping ? classes.rowError : '',
      };
    },
})
