import React from "react";
import { Typography, Button } from "@material-ui/core";
import { Link } from "react-router-dom";

const Anchors = ({ invoiceDataLink }) => {
  return (
    <>
      <Typography variant="overline" gutterBottom>
        {invoiceDataLink.invoiceName}{" "}
      </Typography>
      {invoiceDataLink.links.map((link) => (
        <Button
          key={link.key}
          variant="text"
          color="primary"
          size="small"
          component={Link}
          to={link.to}
          title={link.title}
        >
          {link.label}
        </Button>
      ))}
    </>
  );
};

export default Anchors;