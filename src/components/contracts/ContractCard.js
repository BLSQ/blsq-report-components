import React from "react";
import PropTypes from "prop-types";
import Card from "@material-ui/core/Card";
import Chip from "@material-ui/core/Chip";
import CardContent from "@material-ui/core/CardContent";
import ArrowIcon from "@material-ui/icons/ArrowRightAlt";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import { getOverlaps, getOrgUnitAncestors } from "./utils";
const ContractCard = ({ contract, contractsOverlaps, contractsById }) => (
  <Card
    key={contract.id}
    style={{
      minWidth: "500px",
      margin: "20px",
      flex: "10 10 20%",
      alignSelf: "stretch",
      alignContent: "stretch",
    }}
  >
    <CardContent>
      <Typography color="textPrimary" style={{ fontWeight: "bold" }}>
        {contract.orgUnit.name} <code>{contract.orgUnit.id}</code>
      </Typography>
      <Typography
        style={{
          display: "flex",
          alignItems: "center",
        }}
        component="span"
      >
        {contract.startPeriod} <ArrowIcon /> {contract.endPeriod}{" "}
        &nbsp;&nbsp;&nbsp;&nbsp;
        {contract.codes.map((code) => (
          <Chip key={code} label={code} />
        ))}
      </Typography>
      {contractsOverlaps[contract.id] && (
        <span style={{ color: "red" }}>
          overlaps with :
          {getOverlaps(contract.id, contractsOverlaps, contractsById).map(
            (c) => (
              <li key={c.id}>
                {c.startPeriod} {c.endPeriod} {c.codes.join(",")}
              </li>
            ),
          )}
        </span>
      )}
      <Typography color="textSecondary" title={contract.orgUnit.path}>
        {getOrgUnitAncestors(contract.orgUnit)}
      </Typography>
    </CardContent>
    <CardActions>
      <Button
        size="small"
        to={"/contracts/" + contract.orgUnit.id}
        component={Link}
      >
        Edit
      </Button>
    </CardActions>
  </Card>
);
ContractCard.defaultProps = {
  contractsById: null,
};

ContractCard.propTypes = {
  contract: PropTypes.object.isRequired,
  contractsOverlaps: PropTypes.object.isRequired,
  contractsById: PropTypes.object,
};

export default ContractCard;
