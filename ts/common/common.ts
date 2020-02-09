namespace ooo {
    // #region init
    export let initFuncList: (() => void)[] = [];
    export function init() {
        for (let func of initFuncList) {
            func();
        }
    }
    window.addEventListener("load", init);
    // #endregion

    // #region common function about object.

    /**
     * Error of this library.
     */
    export class oooError {
        message: string = "";
        subLib: string = "";
        innerError: any;
        constructor(subLib: string, message: string) {
            this.subLib = subLib;
            this.message = message;
        }
    }

    /**
     * Read key and value from "infoStr" and set to "obj".
     * If "obj" doesn't have the key, this function shows warning.
     * @param obj Target object
     * @param infoStr A string contains object key and value set. Format should be "key1:value1;key2:value2;...".
     */
    export function setObjectValue(obj: any, infoStr: string) {
        // make key list of "PaneInfo"
        let keys: string[] = [];
        for (let key in obj) { keys.push(key) }

        // convert string to object
        let infoStrSplit = infoStr.split(";");
        for (let infoItem of infoStrSplit) {
            let index = infoItem.indexOf(":");
            if (index == -1) { continue; }
            let key = infoItem.substring(0, index).trim();
            let value = infoItem.substring(index + 1).trim();

            if (keys.indexOf(key) >= 0) {
                obj[key] = parseFloat(value);
            } else {
                console.group("[OOO ERROR] [common]");
                console.warn(obj);
                console.warn(`Invalidate key "${key}" is defined.`);
                console.warn(`"${keys.join(", ")}" is valid.`);
                console.groupEnd();
            }
        }
    }

    export class sortedArray {
        private _array: number[] = [];
        get array() {
            return this._array;
        }
        public add(v: number) {
            let a = 0;
            let b = this._array.length;
            let c = 0;

            while (true) {
                c = Math.floor((a + b) / 2);
                if (this._array[c] == v) {
                    return;
                } else if (a == c) {
                    if (this._array[c] > v) {
                        this._array.splice(c, 0, v);
                    } else {
                        this._array.splice(c + 1, 0, v);
                    }
                    return;
                } else if (this._array[c] > v) {
                    b = c;
                } else {
                    a = c;
                }
            }
        }

        public clear() {
            this._array.length = 0;
        }
        public get last(): number {
            return this._array[this._array.length - 1];
        }
    }

    // #endregion

    // #region math

    /**
     * restrict value to range.
     * @param x value
     * @param l lower limit
     * @param h higher limit
     */
    export function restrict(x: number, l: number, h: number) {
        if (x < l) {
            return l;
        } else if (x > h) {
            return h;
        } else {
            return x;
        }
    }

    // #endregion
}