import { isPrintable } from "./isPrintable";

it("null is not printable", () => {
  expect(isPrintable(null)).toEqual(false);
});

it("undefined is not printable", () => {
  expect(isPrintable(undefined)).toEqual(false);
});

it("By default printable", () => {
  expect(isPrintable({})).toEqual(true);
});

it("If isPrintable false", () => {
  expect(isPrintable({ isPrintable: false })).toEqual(false);
});

it("If isPrintable true", () => {
  expect(isPrintable({ isPrintable: true })).toEqual(true);
});
