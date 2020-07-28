
import React from "react";
import Chip from "@material-ui/core/Chip";
import {
    IconButton,
    Tooltip,
} from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';

import { Link } from "react-router-dom";
import { defaultOptions } from '../../support/table';
import { getOverlaps, getOrgUnitAncestors, getStartDateFromPeriod, getEndDateFromPeriod } from "./utils";


export const contractsColumns = (t, classes, contracts) => [
    {
     name: "orgUnit.name",
     label: t('orgUnit_name'),
     options: {
      filter: false,
      sort: true,
      customBodyRender: (orgUnitName, tableMeta, updateValue) => {
        return (<Tooltip
          arrow
          title={getOrgUnitAncestors(contracts[tableMeta.rowIndex].orgUnit)}
        >
          <span>
            {orgUnitName}
          </span>
        </Tooltip>)
      }
     }
    },
    {
     name: "codes",
     label: t('group'),
     options: {
      filter: true,
      sort: true,
      sortCompare: (order) => (a, b) => (a.data < b.data ? -1 : 1) * (order === "desc" ? 1 : -1),
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
      customBodyRender: (startPeriod, tableMeta, updateValue) => getStartDateFromPeriod(startPeriod).format('DD/MM/YYYY')
     }
    },
    {
     name: "endPeriod",
     label: t('end_period'),
     options: {
      filter: true,
      sort: true,
      customBodyRender: (endPeriod, tableMeta, updateValue) => getEndDateFromPeriod(endPeriod).format('DD/MM/YYYY')
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
            <IconButton size="small" >
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
    print: false,
    setRowProps: (row, dataIndex, rowIndex) => {
        const contract = contracts[dataIndex]
        const isOverlaping = getOverlaps(contract.id, contractsOverlaps, contractsById).length > 0
      return {
        className: isOverlaping ? classes.rowError : '',
      };
    },
})

