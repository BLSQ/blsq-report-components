import BrowseDataRoute from "./BrowseDataRoute";

const BrowseDataPlugin = {
  key: "@blsq/blsq-report-components#browseData",
  extensions: {
    "core.routes": [BrowseDataRoute],

  },
};

export default BrowseDataPlugin;
