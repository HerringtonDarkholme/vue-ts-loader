
export var pushArray = function(arr, toPush) {
    Array.prototype.splice.apply(arr, [0, 0].concat(toPush));
}

export function arrify(val: any) {
	if (val === null || val === undefined) {
		return [];
	}

	return Array.isArray(val) ? val : [val];
};

export function hasOwnProperty(obj, property) {
    return Object.prototype.hasOwnProperty.call(obj, property)
}
