import React from "react";
const CustomPage = props => (
  <div>
    <h1>
      Custom page ! {props.custom} for {props.period}
    </h1>
  </div>
);

export default CustomPage;
