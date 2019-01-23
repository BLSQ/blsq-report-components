import Arrays from "./Arrays";

function mapSlices(size, array) {
  const results = [];
  array.eachSlice(size, slice => {
    results.push(slice);
  });
  return results;
}

it("Should Slice an array", () => {
  expect(mapSlices(1, [1, 2, 3, 4])).toEqual([[1], [2], [3], [4]]);
  expect(mapSlices(2, [1, 2, 3, 4])).toEqual([[1, 2], [3, 4]]);
  expect(mapSlices(3, [1, 2, 3, 4])).toEqual([[1, 2, 3], [4]]);
  expect(mapSlices(4, [1, 2, 3, 4])).toEqual([[1, 2, 3, 4]]);
  expect(mapSlices(5, [1, 2, 3, 4])).toEqual([[1, 2, 3, 4]]);
  expect(mapSlices(5, [])).toEqual([]);
});
