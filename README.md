# @cinko-dev/stash
A browser-based caching utility that utilizes and builds upon the browser's localStorage. With new features like a getElse function, cache expiration and automatic cache refresh.

&nbsp;

## NPM
Install it...
```
npm i @cinko-dev/stash
```
...then import it in your code:
```js
import Stash from '@cinko-dev/stash';
```

&nbsp;

## CDN
Add the `<script>` tag below to the `<head>` section of your website.
```html
<script src="https://cdn.jsdelivr.net/npm/@cinko-dev/stash@1.1.4/Stash.js"></script>
```

&nbsp;

## Initialize
The Stash class uses static methods, so it does not need to be initialized. You can use `Stash.set(...)`, `Stash.get(...)`, `Stash.clear(...)`, etc. wherever you import the class, or you could import it once and set `window.stash` equal to `Stash` like this:
```js
window.stash = Stash;
```
...then you can use it throughout the rest of your application.

&nbsp;

## Practical Examples
Create a React component to display a stock's general information with an update button - that when clicked, will update the stock's information. Use `Stash` to cache the data. The cached data is considered expired after 5 minutes.

### Example 1 - Using Stash.getElse()
This example creates a simple stock component that takes a 'symbol' property containing one stock symbol (this mock api can take AMZN or MSFT). When you click "Update!", it fires the `fetchData()` function which will use `Stash.getElse()` to check the cache for a specific key - `'stock-data-'+this.props.symbol`. If data is found in the cache for the given key, then it will return the value from the cache. If the key does not exist in the cache (or it has expired), then it will fire the 'else' callback function to fetch an alternate value. In this case, within the 'else' callback function we also use `Stash.set()` to store the newly fetched data in the cache for the given key for 300 seconds (5 minutes). We then return the data and set the state - which updates the view.

The next time "Update!" is clicked, if it's been less than 300 seconds (5 miniutes), then the data returned will come from the cache. Otherwise it will refetch the data from the mock api.
```jsx
import React from 'react';
import Stash from '@cinko-dev/stash';

class Stock extends React.Component {

    constructor (props) {
        super(props);
        this.fetchData = this.fetchData.bind(this);
        this.state = { 
            symbol : this.props.symbol ?? 'AMZN',
            name : "",
            price : 0.0
        }
    }

    async fetchData () {
        let stockKey = 'stock-data-'+this.props.symbol;
        const data = await Stash.getElse(stockKey, async (key) => {
            const res = await fetch("https://my-json-server.typicode.com/ccinkosky/cinko-dev-stash/"+this.props.symbol);
            const data = await res.json();
            Stash.set(key, data, 300);
            return data;
        });
        this.setState({
            symbol : data.symbol,
            name : data.name,
            price : data.price
        });
    }

    render () {
        return (
            <>
            <div style={{
                color : '#888',
                backgroundColor : '#FFF',
                border : '2px solid #888',
                borderRadius : '6px',
                margin : '15px',
                padding : '15px',
                maxWidth : '200px'
            }}>
                <div>{ this.state.name }</div>
                <div style={{ fontSize : '18px' }}><b>{ this.state.symbol }</b></div>
                <div style={{ fontSize : '24px' }}><b>{ this.state.price }</b></div>
            </div>
            <div onClick={ this.fetchData }
                style={{
                    color : '#FFF',
                    backgroundColor : '#888',
                    borderRadius : '6px',
                    margin : '15px',
                    padding : '10px',
                    cursor : 'pointer',
                    textAlign : 'center',
                    maxWidth : '200px'
                }}>
                Update!
            </div>
            </>
        )
    }
}

export default Stock;
```


### Example 2 - Using Stash.set() with a refresh function
This example creates a simple stock component that takes a 'symbol' property containing one stock symbol (this mock api can take AMZN or MSFT). After the component has loaded we fetch the inital stock value and then we use `Stash.set()` with a refresh function to set the initial value in the cache. The refresh function will fire automatically whenever the cached item expires and then updates the value stored in the cache for that given key - this way, the value in the cache automatically keeps itself up to date - whether you interact with it or not. When you click "Update!", it fires the `fetchData()` function which will use `Stash.get()` to check the cache for the given key - `'stock-data-'+this.props.symbol`. We then return the data and set the state - which updates the view.

The next time "Update!" is clicked, we just use `Stash.get()` to check the cache again - since the cache keeps itself up to date behind the scenes.
```jsx
import React from 'react';
import Stash from '@cinko-dev/stash';

class Stock extends React.Component {

    constructor (props) {
        super(props);
        this.fetchData = this.fetchData.bind(this);
        this.state = { 
            symbol : this.props.symbol ?? 'AMZN',
            name : "",
            price : 0.0
        }
    }

    async componentDidMount () {
        let stockKey = 'stock-data-'+this.props.symbol;
        const stock = await fetch("https://my-json-server.typicode.com/ccinkosky/cinko-dev-stash/"+this.props.symbol)
        .then(res => { return res.json() })
        .then(data => { return data });
        this.setState({
            symbol : stock.symbol,
            name : stock.name,
            price : stock.price
        });
        Stash.set({
            key : stockKey,
            value : data,
            seconds : 300,
            refreshProps : this.props.symbol,
            refresh : ((symbol) => {
                const stock = fetch("https://my-json-server.typicode.com/ccinkosky/cinko-dev-stash/"+symbol)
                .then(res => { return res.json() })
                .then(data => { return data });
                return stock;
            })
        });
    }

    fetchData () {
        let stockKey = 'stock-data-'+this.props.symbol;
        const data = Stash.get(stockKey);
        this.setState({
            symbol : data.symbol,
            name : data.name,
            price : data.price
        });
    }

    render () {
        return (
            <>
            <div style={{
                color : '#888',
                backgroundColor : '#FFF',
                border : '2px solid #888',
                borderRadius : '6px',
                margin : '15px',
                padding : '15px',
                maxWidth : '200px'
            }}>
                <div>{ this.state.name }</div>
                <div style={{ fontSize : '18px' }}><b>{ this.state.symbol }</b></div>
                <div style={{ fontSize : '24px' }}><b>{ this.state.price }</b></div>
            </div>
            <div onClick={ this.fetchData }
                style={{
                    color : '#FFF',
                    backgroundColor : '#888',
                    borderRadius : '6px',
                    margin : '15px',
                    padding : '10px',
                    cursor : 'pointer',
                    textAlign : 'center',
                    maxWidth : '200px'
                }}>
                Update!
            </div>
            </>
        )
    }
}

export default Stock;
```

&nbsp;

# Documentation

## window.stash.set(key, value, seconds, refresh)
Store a value in the cache by key. You can also set how many seconds until it expires as well as a refresh function to automatically set a new value when it expires.

- @param {string} **key** - The unique key for this entry in the cache.
- @param {*} **value** - Function, object, string, array, etc. This is the value to be stored in the cache.
- @param {integer} **seconds** - The time in seconds until the cache entry expires.
- @param {*} **refreshProps** - Any kind of prop you want passed into your refresh function.
- @param {function} **refresh** - This function will be called when the cached item expires. The return value will replace the current value for this cached item.

Note: seconds and refresh are not required. Their default value is false.

Note: Alternatively, you can also pass in a single object with the object parameters being key, value, seconds, refreshProps and refresh.

Note: Do to inconsitancies when calling .toString() on a function, it is best not to use asynchronous functions as the refresh function. For example, if you were considering using async->await with a fetch, you'd likely be better served using the `fetch().then()` method. 

Note: The refresh function is generally called out of scope from where it was declared. Because of this there are a few additional quirks about working with the refresh function. The refresh function cannot be bound via `bind()` to anything. Unless imported again within the function, `Stash` is not available in the refresh function. However, if you use the `window.stash` method, you're good. Lastly, a single property is passed into the refresh function, you can determine what property is passed into the refresh function by setting the refreshProps parameter in `Stash.set()`. You can pass a string, integer, array, etc. If you need to pass in more than one property, pass in an object of properties.
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
 * function that will set a new value whenever the cached item
 * expires. 
 */
window.stash.set('some-key', 'old value', 600, 'this has', () => {
    return 'new value';
});
/* OR */
window.stash.set({
    key: 'some-key',
    value: 'old value',
    seconds: 600,
    refreshProps: 'this has',
    refresh: (prop) => {
        return prop+' a new value';
    }
});
```

&nbsp;

## window.stash.get(key, full)
Get a value from the cache by key. Values are returned the way they were stored. If you stored an object then the object is returned, if you stored a function then the function is returned, etc.

- @param {string} **key** - the unique key for this entry in the cache.
- @param {boolean} **full** - If false, then only the value of the key is returned. If true then it will return the full cached object for this key - which includes:
    - **key** - the key of the cahced object.
    - **value** - the value of the cached objeect.
    - **type** - the type for the stored value.
    - **expires** - the date the cached object expires (as a unix timestamp). Default: 'no-expire'
    - **seconds** - the seconds value from when the cached item was stored. Default: 'no-expire'
    - **refresh** - the refresh function. Default: false

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
```

&nbsp;

## window.stash.getAll(full)
Get all values or objects from the cache.

- @param {boolean} **full** - If false, then only the value of each key is returned. If true then it will return the full cached object for this key - which includes:
    - **key** - the key of the cahced object.
    - **value** - the value of the cached objeect.
    - **type** - the type for the stored value.
    - **expires** - the date the cached object expires (as a unix timestamp). Default: 'no-expire'
    - **seconds** - the seconds value from when the cached item was stored. Default: 'no-expire'
    - **refresh** - the refresh function. Default: false

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

&nbsp;

## window.stash.getElse(key, callback, full)
The getElse function works like the get function when retrieving a value from the cache, but if the key does not exist (or expired) then call a callback function to return an alternate value.

- @param {string} **key** - the unique key for this entry in the cache.
- @param {function} **callback** - The function to return an alternate value.
- @param {boolean} **full** - If false, then only the value of the key is returned. If true then it will return the full cached object for this key - which includes:
    - **key** - the key of the cahced object.
    - **value** - the value of the cached objeect.
    - **type** - the type for the stored value.
    - **expires** - the date the cached object expires (as a unix timestamp). Default: 'no-expire'
    - **seconds** - the seconds value from when the cached item was stored. Default: 'no-expire'
    - **refresh** - the refresh function. Default: false

Note: The key is passed to your callback function. You could then set the value in the cache again by using window.stash.set().

Note: getElse returns a promise, so the function needs to be called within an asynchronous function using 'await' in order to return the actual value and not another promise.
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

&nbsp;

## window.stash.clear(key)
Remove an entry from the cache by key.

- @param {string} **key** - the unique key for this entry in the cache.
```js
window.stash.clear('your-key');
```

&nbsp;

## window.stash.clearAll()
Remove all entries from the cache.
```js
window.stash.clearAll();
```