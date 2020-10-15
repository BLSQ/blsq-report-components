import pyramidRoutes from "./pyramidRoutes";

const PyramidPlugin = {
  key: "@blsq/blsq-report-components#pyramid",
  extensions: {
    "core.routes": [pyramidRoutes],
  },
};

export default PyramidPlugin;
