import React from "react";


function getColor(value) {
  //value from 0 to 100
  var hue = ((value / 100) * 120).toString(10);
  return ["hsl(", hue, ",50%,50%)"].join("");
}

const CompletionInfo = ({ ratio, completed, expected }) => {

  if (expected == 0) {
    return <></>
  }

  const color = getColor(ratio);

  return (
    <span style={{ color: color }}>
      <b title="completion ratio = completed / expected">{ratio}</b> %<br></br>
      <span title="completed / expected">{completed + "/" + expected}</span>
    </span>
  );
};

export default CompletionInfo;
