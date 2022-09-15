# @cinko-dev/stash
A browser-based caching utility that utilizes and builds upon the browser's localStorage. With new features like cache expiration, cache refresh function - an optional function you pass in when storing in the cache that will automatically run when the cache expires and update the value in the cache with whatever is returned from the refresh function. There is also a getElse function which accepts a callback function as one of it's parameters - if the requested key is not found in the cache, getElse will fire off and return the result of the callback function.

## Installation
```
npm i @cinko-dev/stash
```

## Usage

### Import
```js
import Stash from '@cinko-dev/stash';
```


