import React from "react";
import Cell from "./Cell";
import TestRenderer from "react-test-renderer";

describe("Cell", () => {
  const value = {
    demo: {
      code: "demo code",
      value: 15564.524,
      name: "super",
      period: "2016Q3"
    },
    score: {
      code: "demo code",
      value: 33.333333333333333,
      name: "super",
      period: "2016Q3"
    },
    undefinedScore: {
      code: "demo code",
      value: undefined,
      name: "super",
      period: "2016Q3"
    },
    emptyScore: {
      code: "demo code",
      value: "",
      name: "super",
      period: "2016Q3"
    }

  };

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
    const tree = TestRenderer.create(
      <Cell variant="money" field="demo" value={value} />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });


  it("renders amount with provided field and unit", () => {
    const tree = TestRenderer.create(
      <Cell variant="money" field="demo" value={value} unit="$"/>
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("renders percentage with provided field", () => {
    const tree = TestRenderer.create(
      <Cell variant="percentage" field="demo" value={value} unit="%" bold />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("renders percentage with provided field", () => {
    const tree = TestRenderer.create(
      <Cell variant="percentage" field="demo" value={value} unit="%" bold />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("renders percentage with provided field", () => {
    const tree = TestRenderer.create(
      <Cell variant="percentage" field="score" value={value} unit="%"/>
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("renders undefined percentage with provided field", () => {
    const tree = TestRenderer.create(
      <Cell variant="percentage" field="undefinedScore" value={value} unit="%" />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("renders empty percentage with provided field", () => {
    const tree = TestRenderer.create(
      <Cell variant="percentage" field="emptyScore" value={value} unit="%" />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("renders title with self field", () => {
    const tree = TestRenderer.create(
      <Cell variant="title" field="self" value="demo title" />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("renders text from nested field with link", () => {
    const tree = TestRenderer.create(
      <Cell
        variant="text"
        field="demo.name"
        value={value}
        href="https://google.com"
        bold
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
