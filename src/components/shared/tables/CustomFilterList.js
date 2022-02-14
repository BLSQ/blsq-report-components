import React from "react";
import Chip from "@material-ui/core/Chip";
import { TableFilterList } from "mui-datatables";
import { useTranslation } from "react-i18next";

const CustomChip = ({ label, onDelete }) => {
  const { t } = useTranslation();
  const translationKey = `dataTableFilters.${label.replaceAll(" ", "_")}`;
  const translatedLabel = t(translationKey);
  return <Chip label={translatedLabel === translationKey ? label : translatedLabel} onDelete={onDelete} />;
};

const CustomFilterList = (props) => {
  return <TableFilterList {...props} ItemComponent={CustomChip} />;
};

export default CustomFilterList;
