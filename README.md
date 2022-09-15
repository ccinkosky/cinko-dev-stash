# @cinko-dev/stash
A browser-based caching utility that utilizes and builds upon the browser's localStorage. With new features like a getElse function, cache expiration and automatic cache refresh.

## Installation
```
npm install @cinko-dev/stash
```

## Usage

### Import
```js
import Stash from '@cinko-dev/stash';
```

### Initialize
The Stash class uses static methods, so it does not need to be initialized. After importing, **window.stash** will become available for you to use.

### window.stash.set(key, value, seconds, refresh)
Store a value in the cache by key. You can also set how many seconds until it expires as well as a refresh function to automatically set a new value when it expires.
```js
/**
 * @param {string} key // The unique key for this entry in the cache.
 * @param {mix} value // Function, object, string, array, etc. This is the value
 * to be stored in the cache.
 * @param {integer} seconds // The time in seconds until the cache entry expires.
 * @param {function} refresh // This function will be called when the cached item
 * expires. The return value will replace the current value for this cached item.
 * 
 * Note: seconds and refresh are not required. Their default value is false.
 * Note: Alternatively, you can also pass in a single object with the object
 * parameters being key, value, seconds and refresh.
 */

/**
 * Store a string for 5 minutes (300 seconds) 
 */
window.stash.set('your-key', 'your value', 300);
/* OR */
window.stash.set({
    key: 'your-key',
    value: 'your value',
    seconds: 300
});

/**
 * Store an object until cleared 
 */
window.stash.set('object-cache-key', {
    prop1 : 'value 1',
    prop2 : 'value 2'
});
/* OR */
window.stash.set({
    key: 'object-cache-key',
    value: {
        prop1 : 'value 1',
        prop2 : 'value 2'
    }
});

/**
 * Store an array for 1 minute (60 seconds)
 */
window.stash.set('array-cache-key', [
    'value 1',
    'value 2',
    'value 3'
], 60);
/* OR */
window.stash.set({
    key: 'array-cache-key',
    value: [
        'value 1',
        'value 2',
        'value 3'
    ],
    seconds: 60
});

/**
 * Store a string for 10 minutes (600 seconds) with a refresh function that will
 * set a new value whenever the cached item expires. 
 */
window.stash.set('some-key', 'old value', 600, () => {
    return 'new value';
});
/* OR */
window.stash.set({
    key: 'some-key',
    value: 'old value',
    seconds: 600,
    refresh: () => {
        return 'new value';
    }
});
```

### window.stash.get(key, full)
Get a value from the cache by key. Values are returned the way they were stored. If you stored an object then the object is returned, if you stored a function then the function is returned, etc.
```js
/**
 * @param {string} key // the unique key for this entry in the cache.
 * @param {boolean} full // If false, then only the value of the key is returned.
 * If true then it will return the full cached object for this key - which includes:
 * key - the key of the cahced object.
 * value - the value of the cached objeect.
 * type - the type for the stored value.
 * expires - the date the cached object expires (as a unix timestamp).
 * seconds - the seconds value from when the cached item was stored.
 * refresh - the refresh function.
 * 
 * Note: full is not required. When left out, just the value will be returned.
 * Note: if nothing is found, (boolean) false is returned.
 */


let value = window.stash.get('object-cache-key');
/**
 * Result: (object)
 * {
 *     prop1 : 'value 1',
 *     prop2 : 'value 2'
 * }
 */

let value = Cache.get('object-cache-key', true);
/**
 * Result: (object)
 * {
 *     key : 'object-cache-key',
 *     value : {
 *         prop1 : 'value 1',
 *         prop2 : 'value 2'
 *     },
 *     type : 'object',
 *     expires : 'no-expire',
 *     seconds : 'no-expire',
 *     refresh : false
 * }
 */
```