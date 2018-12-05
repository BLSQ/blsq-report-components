import React from "react";
import Cell from "./Cell";
import TestRenderer from "react-test-renderer";

describe("Cell", () => {
  it("is truthy", () => {
    expect(Cell).toBeTruthy();
  });

  it("renders text with self field", () => {
    const tree = TestRenderer.create(
      <Cell variant="text" field="self" value="demo text" />
    );

    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("renders amount with provided field", () => {
    const value = {
      demo: { code: "demo code", value: 15564.524, name: "super" }
    };
    const tree = TestRenderer.create(
      <Cell variant="money" field="demo" value={value} />
    );

    expect(tree.toJSON()).toMatchSnapshot();
  });
});
