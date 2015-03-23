/* Array functions */
/* Remove item from array */
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

/* Pick random element from array */
Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
};

/* Shuffle array */
Array.prototype.shuffle = function() {
    for(var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
    return this;
};

/* Return size (length) of object */
Object.prototype.size = function() {
    var size = 0, key;
    for (key in this) {
        if (this.hasOwnProperty(key)) size++;
    }
    return size;
};

/* Pick random element from object */
Object.prototype.random = function() {
    var keys = Object.keys(this);
    return this[keys[ keys.length * Math.random() << 0]];
};