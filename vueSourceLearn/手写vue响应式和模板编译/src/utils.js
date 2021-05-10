export function isObject(val) {
  return typeof val === 'object' && val !== null
}

export function isArray(val) {
  return Array.isArray(val)
}

export function isFunction(val) {
  return typeof val === 'function'
}

export function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}