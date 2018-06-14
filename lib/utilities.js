/**
 * Creates an empty object inside namespace if not existent.
 * @param object
 * @param {String} key
 * @param {*} value in key. default is object if no matches in key
 * @example var obj = {};
 * set(obj, 'foo.bar'); // {}
 * console.log(obj);  // {foo:{bar:{}}}
 * @returns {*} it'll return created object or existing object.
 */
export function set (object, key, value) {
    if (typeof key !== 'string') {
        console.warn('Key must be string.');
        return object;
    }

    let keys = key.split('.');
    let copy = object;

    while (key = keys.shift()) {
        if (copy[key] === undefined) {
            copy[key] = {};
        }

        if (value !== undefined && keys.length === 0) {
            copy[key] = value;
        }

        copy = copy[key];
    }

    return object;
}

/**
 * Returns nested property value.
 * @param obj
 * @param key
 * @param defaultValue {*=undefined}
 * @example var obj = {
        foo : {
            bar : 11
        }
    };

 get(obj, 'foo.bar'); // "11"
 get(obj, 'ipsum.dolorem.sit');  // undefined
 * @returns {*} found property or undefined if property doesn't exist.
 */
export function get (object, key, defaultValue) {
    if (typeof object !== 'object' || object === null) {
        return defaultValue;
    }

    if (typeof key !== 'string') {
        throw new Error('Key must be string.');
    }

    var keys = key.split('.');
    var last = keys.pop();

    while (key = keys.shift()) {
        object = object[key];

        if (typeof object !== 'object' || object === null) {
            return defaultValue;
        }
    }

    return object && object[last] !== undefined ? object[last] : defaultValue;
}

/**
 * Extening object that entered in first argument.
 *
 * Returns extended object or false if have no target object or incorrect type.
 *
 * If you wish to clone source object (without modify it), just use empty new
 * object as first argument, like this:
 *   deepExtend({}, yourObj_1, [yourObj_N]);
 */
export function deepExtend (/*obj_1, [obj_2], [obj_N]*/) {
    if (arguments.length < 1 || typeof arguments[0] !== 'object') {
        return false;
    }

    if (arguments.length < 2) {
        return arguments[0];
    }

    var target = arguments[0];

    // convert arguments to array and cut off target object
    var args = Array.prototype.slice.call(arguments, 1);

    var val, src, clone;

    args.forEach(function (obj) {
        // skip argument if it is array or isn't object
        if (typeof obj !== 'object' || Array.isArray(obj)) {
            return;
        }

        Object.keys(obj).forEach(function (key) {
            src = target[key]; // source value
            val = obj[key]; // new value

            // recursion prevention
            if (val === target) {
                return;

                /**
                 * if new value isn't object then just overwrite by new value
                 * instead of extending.
                 */
            } else if (typeof val !== 'object' || val === null) {
                target[key] = val;
                return;

                // just clone arrays (and recursive clone objects inside)
            } else if (Array.isArray(val)) {
                target[key] = deepCloneArray(val);
                return;

            } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
                target[key] = deepExtend({}, val);
                return;

                // source value and new value is objects both, extending...
            } else {
                target[key] = deepExtend(src, val);
                return;
            }
        });
    });

    return target;
}

/**
 * Recursive cloning array.
 */
function deepCloneArray(arr) {
    var clone = [];
    arr.forEach(function (item, index) {
        if (typeof item === 'object' && item !== null) {
            if (Array.isArray(item)) {
                clone[index] = deepCloneArray(item);
            } else {
                clone[index] = deepExtend({}, item);
            }
        } else {
            clone[index] = item;
        }
    });
    return clone;
}

// PRIVATE PROPERTIES
const BYPASS_MODE = '__bypassMode';
const IGNORE_CIRCULAR = '__ignoreCircular';
const MAX_DEEP = '__maxDeep';
const CACHE = '__cache';
const QUEUE = '__queue';
const STATE = '__state';
const {floor} = Math;
const {keys} = Object;

const EMPTY_STATE = {};

export function Emitter () {
    this._listeners = {};
}

Emitter.prototype.emit = function emit(eventType) {
    if (!Array.isArray(this._listeners[eventType])) {
        return this;
    }
    var args = Array.prototype.slice.call(arguments, 1);
    this._listeners[eventType].forEach(function _emit(listener) {
        listener.apply(this, args);
    }, this);

    return this;
};

Emitter.prototype.on = function on(eventType, listener) {
    if (!Array.isArray(this._listeners[eventType])) {
        this._listeners[eventType] = [];
    }

    if (this._listeners[eventType].indexOf(listener) === -1) {
        this._listeners[eventType].push(listener);
    }

    return this;
};

Emitter.prototype.once = function once(eventType, listener) {
    var self = this;
    function _once() {
        var args = Array.prototype.slice.call(arguments, 0);
        self.off(eventType, _once);
        listener.apply(self, args);
    }
    _once.listener = listener;
    return this.on(eventType, _once);
};

Emitter.prototype.off = function off(eventType, listener) {
    if (!Array.isArray(this._listeners[eventType])) {
        return this;
    }
    if (typeof listener === 'undefined') {
        this._listeners[eventType] = [];
        return this;
    }
    var index = this._listeners[eventType].indexOf(listener);
    if (index === -1) {
        for (var i = 0; i < this._listeners[eventType].length; i += 1) {
            if (this._listeners[eventType][i].listener === listener) {
                index = i;
                break;
            }
        }
    }
    this._listeners[eventType].splice(index, 1);
    return this;
};



export class RecursiveIterator {
    /**
     * @param {Object|Array} root
     * @param {Number} [bypassMode='vertical']
     * @param {Boolean} [ignoreCircular=false]
     * @param {Number} [maxDeep=100]
     */
    constructor(root, bypassMode = 'vertical', ignoreCircular = false, maxDeep = 100) {
        this[BYPASS_MODE] = (bypassMode === 'horizontal' || bypassMode === 1);
        this[IGNORE_CIRCULAR] = ignoreCircular;
        this[MAX_DEEP] = maxDeep;
        this[CACHE] = [];
        this[QUEUE] = [];
        this[STATE] = this.getState(undefined, root);
        this.__makeIterable();
    }
    /**
     * @returns {Object}
     */
    next() {
        var {node, path, deep} = this[STATE] || EMPTY_STATE;

        if (this[MAX_DEEP] > deep) {
            if (this.isNode(node)) {
                if (this.isCircular(node)) {
                    if (this[IGNORE_CIRCULAR]) {
                        // skip
                    } else {
                        throw new Error('Circular reference');
                    }
                } else {
                    if (this.onStepInto(this[STATE])) {
                        let descriptors = this.getStatesOfChildNodes(node, path, deep);
                        let method = this[BYPASS_MODE] ? 'push' : 'unshift';
                        this[QUEUE][method](...descriptors);
                        this[CACHE].push(node);
                    }
                }
            }
        }

        var value = this[QUEUE].shift();
        var done = !value;

        this[STATE] = value;

        if (done) this.destroy();

        return {value, done};
    }
    /**
     *
     */
    destroy() {
        this[QUEUE].length = 0;
        this[CACHE].length = 0;
        this[STATE] = null;
    }
    /**
     * @param {*} any
     * @returns {Boolean}
     */
    isNode(any) {
        return isTrueObject(any);
    }
    /**
     * @param {*} any
     * @returns {Boolean}
     */
    isLeaf(any) {
        return !this.isNode(any);
    }
    /**
     * @param {*} any
     * @returns {Boolean}
     */
    isCircular(any) {
        return this[CACHE].indexOf(any) !== -1
    }
    /**
     * Returns states of child nodes
     * @param {Object} node
     * @param {Array} path
     * @param {Number} deep
     * @returns {Array<Object>}
     */
    getStatesOfChildNodes(node, path, deep) {
        return getKeys(node).map(key =>
            this.getState(node, node[key], key, path.concat(key), deep + 1)
        );
    }
    /**
     * Returns state of node. Calls for each node
     * @param {Object} [parent]
     * @param {*} [node]
     * @param {String} [key]
     * @param {Array} [path]
     * @param {Number} [deep]
     * @returns {Object}
     */
    getState(parent, node, key, path = [], deep = 0) {
        return {parent, node, key, path, deep};
    }
    /**
     * Callback
     * @param {Object} state
     * @returns {Boolean}
     */
    onStepInto(state) {
        return true;
    }
    /**
     * Only for es6
     * @private
     */
    __makeIterable() {
        try {
            this[Symbol.iterator] = () => this;
        } catch(e) {}
    }
};

const GLOBAL_OBJECT = typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this;

/**
 * @param {*} any
 * @returns {Boolean}
 */
function isGlobal (any) {
    return any === GLOBAL_OBJECT;
}

function isTrueObject (any) {
    return any !== null && typeof any === 'object';
}


/**
 * @param {*} any
 * @returns {Boolean}
 */
function isArrayLike (any) {
    if (!isTrueObject(any)) return false;
    if (isGlobal(any)) return false;
    if(!('length' in any)) return false;
    let length = any.length;
    if(length === 0) return true;
    return (length - 1) in any;
}


/**
 * @param {Object|Array} object
 * @returns {Array<String>}
 */
function getKeys (object) {
    let keys_ = keys(object);
    if (Array.isArray(object)) {
        // skip sort
    } else if(isArrayLike(object)) {
        // only integer values
        keys_ = keys_.filter((key) => floor(Number(key)) == key);
        // skip sort
    } else {
        // sort
        keys_ = keys_.sort();
    }
    return keys_;
}

