# @cinko-dev/stash
A browser-based caching utility that utilizes and builds upon the browser's localStorage. With new features like a getElse function, cache expiration and automatic cache refresh.


## NPM
Install it...
```
npm i @cinko-dev/stash
```
...then import it in your code:
```js
import Stash from '@cinko-dev/stash';
```


## CDN
Add the **&lt;script&gt;** tag below to the **&lt;head&gt;** section of your website.
```html
<script src="https://cdn.jsdelivr.net/npm/@cinko-dev/stash@1.1.3/Stash.js"></script>
```


### Initialize
The Stash class uses static methods, so it does not need to be initialized. You can use **Stash** (Stash.set(...), Stash.get(...), etc) wherever you import the class, or you could import it once and set **window.stash** equal to **Stash** like this:
```js
window.stash = Stash;
```
...then you can use it throughout the rest of your application.


### window.stash.set(key, value, seconds, refresh)
Store a value in the cache by key. You can also set how many seconds until it expires as well as a refresh function to automatically set a new value when it expires.

- @param {string} key // The unique key for this entry in the cache.
- @param {*} value // Function, object, string, array, etc. This is the value to be stored in the cache.
- @param {integer} seconds // The time in seconds until the cache entry expires.
- @param {function} refresh // This function will be called when the cached item expires. The return value will replace the current value for this cached item.

Note: seconds and refresh are not required. Their default value is false.

Note: Alternatively, you can also pass in a single object with the object parameters being key, value, seconds and refresh.
```js
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
 * Store a string for 10 minutes (600 seconds) with a refresh
 * function that willvset a new value whenever the cached item
 * expires. 
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

- @param {string} key // the unique key for this entry in the cache.
- @param {boolean} full // If false, then only the value of the key is returned. If true then it will return the full cached object for this key - which includes:
    - key - the key of the cahced object.
    - value - the value of the cached objeect.
    - type - the type for the stored value.
    - expires - the date the cached object expires (as a unix timestamp). Default: 'no-expire'
    - seconds - the seconds value from when the cached item was stored. Default: 'no-expire'
    - refresh - the refresh function. Default: false

Note: full is not required. When left out, just the value will be returned.

Note: if nothing is found, (boolean) false is returned.
```js
/* These are utilizing the window.stash.set examples above... */

let value = window.stash.get('object-cache-key');
/**
 * Result: (object)
 * {
 *     prop1 : 'value 1',
 *     prop2 : 'value 2'
 * }
 */

let value = window.stash.get('object-cache-key', true);
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

let value = window.stash.get('some-key');
/**
 * Result if less than 600 seconds since set: (string) 'old value'
 * Result if more than 600 seconds since set: (string) 'new value'
 */

let value = window.stash.get('some-key', true);
/**
 * Result if less than 600 seconds since set: (object)
 * {
 *     key : 'some-key',
 *     value : 'old value',
 *     type : 'string',
 *     expires : 1663265239,
 *     seconds : 600,
 *     refresh : () => {
 *         return 'new value';
 *     }
 * }
 */

/**
 * If you would like to get the result of the refresh function before
 * the cached item expires, you can use window.stash.get with full = true
 * and then call the refresh function like so:
 */
let value = window.stash.get('some-key', true).refresh();
/**
 * Result: (string) 'new value'
 */
```


### window.stash.getAll(full)
Get all values or objects from the cache.

- @param {boolean} full // If false, then only the value of each key is returned. If true then it will return the full cached object for this key - which includes:
    - key - the key of the cahced object.
    - value - the value of the cached objeect.
    - type - the type for the stored value.
    - expires - the date the cached object expires (as a unix timestamp). Default: 'no-expire'
    - seconds - the seconds value from when the cached item was stored. Default: 'no-expire'
    - refresh - the refresh function. Default: false

Note: full is not required, it's false by default.

Note: This function returns an object of key => vakue pairs.
```js
/* These are utilizing the window.stash.set examples above... */

let cached = window.stash.getAll();
/**
 * Result: (object)
 * { 
 *     'your-key' : 'your value',
 *     'object-cache-key' : {
 *         prop1 : 'value 1',
 *         prop2 : 'value 2'
 *     },
 *     'array-cache-key' : [
 *         'value 1',
 *         'value 2',
 *         'value 3'
 *     ],
 *     'some-key' : 'new value'
 * }
 */

let cached = window.stash.getAll(true);
/**
 * Result: (object)
 * { 
 *     'your-key' : {
 *         key : 'your-key',
 *         value : 'your value',
 *         type : 'string',
 *         expires : 1663265239,
 *         seconds : 600,
 *         refresh : false
 *     },
 *     'object-cache-key' : {
 *         key : 'object-cache-key',
 *         value : {
 *             prop1 : 'value 1',
 *             prop2 : 'value 2'
 *         },
 *         type : 'object',
 *         expires : 'no-expire',
 *         seconds : 'no-expire',
 *         refresh : false
 *     },
 *     'array-cache-key' : {
 *         key : 'array-cache-key',
 *         value : [
 *             'value 1',
 *             'value 2',
 *             'value 3'
 *         ],
 *         type : 'array',
 *         expires : 1663265239,
 *         seconds : 60,
 *         refresh : false
 *     },
 *     'some-key' : {
 *         key : 'some-key',
 *         value : 'new value',
 *         type : 'string',
 *         expires : 1663265239,
 *         seconds : 600,
 *         refresh : () => {
 *             return 'new value';
 *         }
 *     }
 * }
 */
```


### window.stash.getElse(key, callback, full)
The getElse function works like the get function when retrieving a value from the cache, but if the key does not exist (or expired) then call a callback function to return an alternate value.

- @param {string} key // the unique key for this entry in the cache.
- @param {function} callback // The function to return an alternate value.
- @param {boolean} full // If false, then only the value of the key is returned. If true then it will return the full cached object for this key - which includes:
    - key - the key of the cahced object.
    - value - the value of the cached objeect.
    - type - the type for the stored value.
    - expires - the date the cached object expires (as a unix timestamp). Default: 'no-expire'
    - seconds - the seconds value from when the cached item was stored. Default: 'no-expire'
    - refresh - the refresh function. Default: false

Note: The key is passed to your callback function. You could then set the value in the cache again by using window.stash.set().

Note: getElse returns a promise, so the function needs to be called within an asynchronous function using 'await' in order to return the actual value and not another promise.

Note: Do to the inconsistant behavior when calling .toString() on a function, it is best for your function not too use async->await and rather use .then() if it needs to await on a promise.
```js
/**
 * Get a value stored in the cache under 'user-name'. If it doesn't
 * exist, then return the value of the callback function.
 */
(async () => {
    var newValue = await window.stash.getElse('user-name', (key) => {
        return fetch("/some/api/you/have/setup")
        .then(res => { return res.json() })
        .then(data => { return data.username });
    });
    // do something with newValue
    console.log(newValue);
})();

/* OR */

const someFunction = async () => {
    var newValue = await window.stash.getElse('user-name', (key) => {
        return fetch("/some/api/you/have/setup")
        .then(res => { return res.json() })
        .then(data => { return data.username });
    });
    // do something with newValue
    console.log(newValue);
}
someFunction();
```

### window.stash.clear(key)
Remove an entry from the cache by key.

- @param {string} key // the unique key for this entry in the cache.
```js
window.stash.clear('your-key');
```

### window.stash.clearAll()
Remove all entries from the cache.
```js
window.stash.clearAll();
```