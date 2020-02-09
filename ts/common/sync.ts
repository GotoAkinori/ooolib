namespace ooo {
    /**
     * List of items with synchronized property. 
     */
    export class SyncList<T> {
        private syncList: { [key: string]: T[] } = {};

        public constructor() { }

        /**
         * Add an item to list.
         * @param id The name of class to add.
         * @param item The item to add.
         */
        public addItem(id: string, item: T) {
            let list = this.syncList[id];
            if (list === undefined) {
                list = [];
                this.syncList[id] = list;
            }
            list.push(item);
        }

        /**
         * Synchronize item property.
         * @param id The name of class to add.
         * @param item Standard item. All items property is set as this item property value.
         * @param setValue Function to set property value.
         * @param getValue Function to get property value.
         */
        public sync<V>(
            id: string,
            item: T,
            setValue: (elem: T, value: V) => void,
            getValue: (elem: T) => V
        ) {
            let list = this.syncList[id];
            if (list === undefined) {
                return;
            } else {
                let value = getValue(item);
                for (let sItem of list) {
                    if (item !== sItem) {
                        setValue(sItem, value);
                    }
                }
            }
        }

        /**
         * Synchronize item property by max value.
         * @param id The name of class to add.
         * @param setValue Function to set property value.
         * @param getValue Function to get property value.
         */
        public setMax<V>(
            id: string,
            setValue: (elem: T, value: V) => void,
            getValue: (elem: T) => V
        ) {
            let list = this.syncList[id];
            if (list === undefined || list.length == 0) {
                return;
            } else {
                // get max
                let max: null | V = null;
                for (let item of list) {
                    let v = getValue(item);
                    if (max === null) {
                        max = v;
                    } else if (max < v) {
                        max = v;
                    }
                }

                // set max value
                for (let item of list) {
                    setValue(item, max!);
                }
            }
        }
    }
}
