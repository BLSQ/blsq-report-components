import React from "react";

const styles = {
  warning: { color: "red" }
};

const Warning = props => {
  return (
    <React.Fragment>
      <br />
      <span style={styles.warning}>{props.message}</span>
    </React.Fragment>
  );
};

export default Warning;
