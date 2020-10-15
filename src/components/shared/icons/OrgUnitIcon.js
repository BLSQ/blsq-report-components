import React from "react";
import SvgIcon from "@material-ui/core/SvgIcon";

const OrgUnitIcon = (props) => {
  const finalProps = {
    ...props,
    viewBox: "0 0 85 85",
  };
  return (
    <SvgIcon {...finalProps}>
      <path d="M17.518403,78.3591 C16.2139001,78.3570957 15.0595734,77.5172438 14.660803,76.28 L0.1493927,31.77603 C-0.249658449,30.5438778 0.191427305,29.1958057 1.242723,28.43453 L39.235803,0.93513 C40.2882476,0.175265921 41.7117584,0.175265921 42.764203,0.93513 L80.757302,28.43453 C81.8085865,29.1958138 82.2496596,30.5438843 81.850602,31.77603 L67.339202,76.28 C66.9404317,77.5172435 65.7861055,78.3570953 64.481603,78.3591 L17.518403,78.3591 L17.518403,78.3591 Z M19.705003,72.3692 L62.295003,72.3692 L75.464602,31.99883 L41.000003,7.07363 L6.535413,31.99883 L19.705003,72.3692 Z" />
    </SvgIcon>
  );
};

export default OrgUnitIcon;
