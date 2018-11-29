export function indexBy(array, f) {
  var groups = {};
  array.forEach(function(o) {
    var group = f(o);
    groups[group] = o;
  });
  return groups;
}
