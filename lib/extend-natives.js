
// thanks! http://onemoredigit.com/post/1527191998/extending-objects-in-node-js
Object.defineProperty(Object.prototype, "extend", {
    enumerable: false,
    value: function(from) {
        var props = Object.getOwnPropertyNames(from);
        var dest = this;
        props.forEach(function(name) {
            if (name in dest) {
                var destination = Object.getOwnPropertyDescriptor(from, name);
                Object.defineProperty(dest, name, destination);
            }
        });
        return this;
    }
});

Array.prototype.contains = function (x) {
  return this.indexOf(x) > -1
}

Object.defineProperty(Array.prototype, 'remove', function (idx) {
  return idx > -1 ? this.slice(0, idx).concat(this.slice(idx+1)) : this
})

Object.defineProperty(String.prototype, 'trim', function () {
  return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
})

