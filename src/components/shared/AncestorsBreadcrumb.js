import React from "react";
import { Link } from "react-router-dom";

const AncestorsBreadcrumbs = ({orgUnit, link}) => {
  return (
    <>
      {orgUnit && orgUnit.ancestors && 
        orgUnit.ancestors.slice(1, orgUnit.ancestors.length - 1).map((ancestor, index) => {
          return (
            <span key={"ancestor" + index}>
              <Link to={link(ancestor)}>{ancestor.name}</Link>
              {index < orgUnit.ancestors.length - 3 && "  >  "}
            </span>
          );
        })}
    </>
  );
};

export default AncestorsBreadcrumbs;
