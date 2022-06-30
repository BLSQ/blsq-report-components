import React from "react";
import { Link } from "react-router-dom";

const AncestorsBreadcrumbs = ({orgUnit, link, limit}) => {
  const actualLimit = limit == undefined ? 0 : limit
  return (
    <>
      {orgUnit && orgUnit.ancestors && 
        orgUnit.ancestors.slice(1, orgUnit.ancestors.length - actualLimit).map((ancestor, index) => {
          return (
            <span key={"ancestor" + index}>
              <Link to={link(ancestor)}>{ancestor.name}</Link>
              {index < (orgUnit.ancestors.length - 2 - actualLimit) && "  >  "}
            </span>
          );
        })}
    </>
  );
};

export default AncestorsBreadcrumbs;
