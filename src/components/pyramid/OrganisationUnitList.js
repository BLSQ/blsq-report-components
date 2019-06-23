import React from "react";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import DefaultTableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";

const TableCell = withStyles(theme => ({
  head: {
    fontWeight: "bold",
    fontSize: 14
  },
  body: {}
}))(DefaultTableCell);

const groupsBelongingToGroupSet = (ou, groupset) => {
  const groupIds = ou.organisationUnitGroups.map(g => g.id);
  return groupset.organisationUnitGroups.filter(g => groupIds.includes(g.id));
};

const OrganisationUnitList = props => {
  const { organisationUnits, organisationUnitGroupSets } = props;
  return (
    <Paper>
      <Table style={{}}>
        <TableHead>
          <TableRow>
            <TableCell rowSpan="2">Levels</TableCell>
            <TableCell rowSpan="2">Org Unit Name</TableCell>
            {organisationUnitGroupSets.map(groupset => (
              <TableCell>{groupset.name}</TableCell>
            ))}
            <TableCell />
          </TableRow>
          <TableRow>
            {organisationUnitGroupSets.map(groupset => (
              <TableCell>
                {groupset.organisationUnitGroups.map(g => (
                  <React.Fragment>
                    {g.name}
                    <br />
                  </React.Fragment>
                ))}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {organisationUnits.map(ou => (
            <TableRow>
              <TableCell>
                {ou.ancestors && ou.ancestors[1] && ou.ancestors[1].name}
                <br />
                {ou.ancestors && ou.ancestors[2] && ou.ancestors[2].name}
              </TableCell>
              <TableCell
                title={ou.organisationUnitGroups.map(g => g.name).join(", ")}
              >
                {ou.name}
              </TableCell>
              {organisationUnitGroupSets.map(groupset => (
                <TableCell>
                  {groupsBelongingToGroupSet(ou, groupset)
                    .map(group => group.name)
                    .join(", ")}
                </TableCell>
              ))}
              <TableCell align="right">
                <Button
                  color="primary"
                  onClick={props.openForEdition.bind(this, ou)}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default OrganisationUnitList;
