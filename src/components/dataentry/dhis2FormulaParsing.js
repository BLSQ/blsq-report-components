export const parseDependencies = (expression) => {
    const components = expression
      .split("+")
      .flatMap((s) => s.split(","))
      .flatMap((s) => s.split("-"))
      .flatMap((s) => s.split("*"))
      .flatMap((s) => s.split("/"))
      .flatMap((s) => s.split("ROUND("))
      .flatMap((s) => s.split("IF("))
      .flatMap((s) => s.split("SAFE_DIV("))
      .flatMap((s) => s.split("ABS("))
      .flatMap((s) => s.split("("))
      .flatMap((s) => s.split(")"))
      .map((s) => s.trim());
    const deReferences = components.filter((s) => s.includes("#{"));
    const deps = deReferences.map((de) => de.replace("#{", "").replace("}", ""));
  
    return Array.from(new Set(deps));
  };
  
  export const safeDiv = (a, b) => {
    if (b !== 0) {
      return a / b;
    }
    return 0;
  };
  
  export const abs = (a) => {
    return Math.abs(a);
  };
  
  export const iff = (a, b, c) => {
    return a ? b : c;
  };
  
  export const roundFunction = (a, position) => {
    return a.toFixed(position);
  };
  