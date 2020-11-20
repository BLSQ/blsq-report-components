import IncentiveRoute from "./IncentiveRoute";

const IncentivePlugin = {
  key: "@blsq/blsq-report-components#incentives",
  extensions: {
    "core.routes": [IncentiveRoute],

  },
};

export default IncentivePlugin;
