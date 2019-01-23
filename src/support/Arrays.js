Array.prototype.eachSlice = function(size, callback) {
  for (var i = 0, l = this.length; i < l; i += size) {
    callback.call(this, this.slice(i, i + size));
  }
};

export function indexBy(array, f) {
  var groups = {};
  array.forEach(function(o) {
    var group = f(o);
    groups[group] = o;
  });
  return groups;
}
