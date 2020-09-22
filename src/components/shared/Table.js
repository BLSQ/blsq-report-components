import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core";
import MUIDataTable from "mui-datatables";

import tablesStyles from "../styles/tables";

const styles = (theme) => ({
  ...tablesStyles(theme),
});

const useStyles = makeStyles((theme) => styles(theme));
const Table = ({ options, title, data, columns, isLoading }) => {
  const classes = useStyles();
  const dataTable = useMemo(() => {
    return (
      <MUIDataTable
        classes={{
          paper: classes.tableContainer,
        }}
        title={title}
        data={data}
        columns={columns}
        options={
          !isLoading
            ? options
            : {
                ...options,
                textLabels: {
                  ...options.textLabels,
                  body: { ...options.textLabels.body, noMatch: "" },
                },
              }
        }
      />
    );
  }, [data, isLoading]);
  return dataTable;
};

Table.propTypes = {
  options: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  title: PropTypes.any,
  //   isLoading: PropTypes.bool.isRequired,
};

export default Table;
