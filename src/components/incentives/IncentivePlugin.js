import IncentiveRoute from "./IncentiveRoute";

const IncentivePlugin = {
  key: "incentives",
  extensions: {
    "core.routes": [IncentiveRoute],

  },
};

export default IncentivePlugin;
