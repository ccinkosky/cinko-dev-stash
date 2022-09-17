/**
MIT License

Copyright (c) 2022 Corey Cinkosky
https://www.npmjs.com/package/@cinko-dev/stash

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

class Stash {
    
    static get key () { return '@cinko-dev/stash' };
    static get sep () { return ']-[' };
    static get noExpire () { return 'no-expire' };

    static set (pkg, value = false, seconds = false, refreshProps = false, refresh = false) {
        if (typeof pkg === 'string') {
            pkg = {
                key : pkg,
                value : value,
                seconds : seconds ? seconds : this.noExpire,
                refresh : typeof refresh === 'function' ? refresh : false,
                refreshProps : refreshProps
            }
        } else {
            typeof pkg.refresh !== 'function' ? pkg.refresh = false : '';
        }
        
        if (typeof pkg.seconds === 'undefined') { pkg.seconds = this.noExpire }
        if (typeof pkg.refresh === 'undefined') { pkg.refresh = false }
        Object.keys(localStorage).forEach((existingKey) => {
            let keyData = existingKey.split(this.sep);
            if (keyData[0] === this.key && keyData[2] === pkg.key) {
                localStorage.removeItem(existingKey);
            }
        });
        let storageObject = {
            key : pkg.key,
            value : pkg.value,
            type : typeof pkg.value,
            seconds : pkg.seconds,
            refresh : pkg.refresh,
            refreshProps : pkg.refreshProps
        };
        let storageExpire = pkg.seconds === this.noExpire ? pkg.seconds : Math.floor(Date.now()/1000)+(pkg.seconds);
        storageObject.expires = storageExpire;
        let storageKey = this.key+this.sep;
        storageKey += storageExpire.toString()+this.sep
        storageKey += pkg.key.toString();
        let storageString = this.jsonStringify(storageObject);
        localStorage.setItem(storageKey, storageString);
    }

    static get (key, full = false) {
        var returnValue = false;
        Object.keys(localStorage).forEach((existingKey) => {
            let keyData = existingKey.split(this.sep);
            if (keyData[0] === this.key && keyData[2] === key) {
                let storageObject = this.jsonParse(localStorage.getItem(existingKey));
                if (full) {
                    returnValue = storageObject;
                } else {
                    returnValue = storageObject.value;
                }
            }
        });
        return returnValue;
    }

    static getAll (full = false) {
        let cache = {};
        Object.keys(localStorage).forEach((existingKey) => {
            let keyData = existingKey.split(this.sep);
            if (keyData[0] === this.key) {
                let storageObject = this.jsonParse(localStorage.getItem(existingKey));
                if (full) {
                    cache[keyData[2]] = storageObject;
                } else {
                    cache[keyData[2]] = storageObject.value;
                }
            }
        });
        return cache;
    }

    static async getElse (key, callback, full = false) {
        let data = this.get(key, full);
        if (data) {
            return data;
        } else {
            return await callback(key);
        }
    }

    static clear (key) {
        Object.keys(localStorage).forEach((existingKey) => {
            let keyData = existingKey.split(this.sep);
            if (keyData[0] === this.key && keyData[2] === key) {
                localStorage.removeItem(existingKey);
            }
        });
    }

    static clearAll () {
        Object.keys(localStorage).forEach((existingKey) => {
            let keyData = existingKey.split(this.sep);
            if (keyData[0] === this.key) {
                localStorage.removeItem(existingKey);
            }
        });
    }

    static checkExpired () {
        Object.keys(localStorage).forEach((existingKey) => {
            let keyData = existingKey.split(this.sep);
            if (keyData[0] === this.key) {
                let storageExpire = parseInt(keyData[1]);
                if (!(storageExpire === this.noExpire) && storageExpire <= Math.floor(Date.now()/1000)) {
                    var existing = this.get(keyData[2], true);
                    if (typeof existing.refresh === 'undefined' || !existing.refresh) {
                        localStorage.removeItem(existingKey);
                    } else {
                        (async () => {
                            this.set({
                                key : keyData[2],
                                value : await existing.refresh(existing.refreshProps),
                                seconds : existing.seconds,
                                refresh : existing.refresh
                            });
                        })();
                    }
                }
            }
        });
    }

    static jsonStringify (object) {
        return JSON.stringify(object, (key, value) => {
            if (typeof value === "function") {
                return "/Function("+value.toString()+")/";
            }
            return value;
        });
    }
    
    static jsonParse (json) {
        return JSON.parse(json, (key, value) => {
            if (typeof value === "string" && value.startsWith("/Function(") && value.endsWith(")/")) {
                value = value.substring(10, value.length-2);
                return (0, eval)("("+value+")");
            }
            if (value._state && value._state._typeOf && value._state._typeOf == 'subscribable') {
                var reserved = value._state._reserved;
                var callbacks = value._state._callbacks;
                var newObject = {};
                var nonStates = [];
                Object.keys(value._state).forEach((prop) => {
                    if(!reserved.includes(prop)) {
                        if (typeof value._state[prop]._state === 'undefined') {
                            newObject[prop] = value._state[prop];
                            nonStates.push(prop);
                        } else {
                            newObject[prop] = value._state[prop]._state;
                        }
                    }
                });
                var sub = new Subscribable(newObject);
                sub._state._callbacks = callbacks;
                nonStates.forEach(prop => sub._state[prop] = sub._state[prop].state);
                return sub;
            } else {
                return value;
            }
        });
    }
}

if (!window.stash_init) {
    setInterval(() => Stash.checkExpired(), 1000);
    window.stash_init = true;
}

export default Stash;