import React from "react";
const LandscapeOrientation = () => (
  <React.Fragment>
    <style type="text/css">
      {
        "@media print{@page {size: A4 landscape}; .invoicePage {width: 100%; margin: 0; };"
      }
    </style>
    <style type="text/css">
      {
        "@media screen {  .invoicePage {    width: 29.7cm;    margin: auto  } } ;"
      }
    </style>
  </React.Fragment>
);

const PortraitOrientation = () => (
  <React.Fragment>
    <style type="text/css">
      {
        "@media print{@page {size: A4 portrait}; .invoicePage {width: 100%; margin: 0; }"
      }
    </style>
    <style type="text/css">
      {"@media screen {  .invoicePage {    width: 21cm;    margin: auto  } } "}
    </style>
  </React.Fragment>
);

const PageOrientation = props => (
  <React.Fragment>
    {props.orientation === "landscape" && <LandscapeOrientation />}
    {props.orientation === "portrait" && <PortraitOrientation />}
  </React.Fragment>
);

export default PageOrientation;
