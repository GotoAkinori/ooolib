namespace ooo.syncScroll {
    let syncX: SyncList<HTMLElement> = new SyncList();
    let syncY: SyncList<HTMLElement> = new SyncList();

    const SYNC_X_ID = "ooo_sync_scrollx_id";
    const SYNC_Y_ID = "ooo_sync_scrolly_id";

    // init function
    function initSyncScroll() {
        let syncXItems = document.querySelectorAll("*[data-" + SYNC_X_ID + "]");
        syncXItems.forEach((elem: Element, i: number) => {
            if (elem instanceof HTMLElement) {
                let id = elem.dataset[SYNC_X_ID]!;
                addSyncItemX(id, elem);
            }
        });

        let syncYItems = document.querySelectorAll("*[data-" + SYNC_Y_ID + "]");
        syncYItems.forEach((elem: Element, i: number) => {
            if (elem instanceof HTMLElement) {
                let id = elem.dataset[SYNC_Y_ID]!;
                addSyncItemY(id, elem);
            }
        });
    };

    function addSyncItemX(id: string, elem: HTMLElement) {
        elem.dataset[SYNC_X_ID] = id;

        // add to sync list
        syncX.addItem(id, elem);

        // set scroll event
        elem.addEventListener("scroll", (ev: Event) => {
            syncX.sync<number>(id, elem,
                (e, v) => { e.scrollLeft = v; },
                (e) => e.scrollLeft);
        });
    }

    function addSyncItemY(id: string, elem: HTMLElement) {
        elem.dataset[SYNC_Y_ID] = id;

        // add to sync list
        syncY.addItem(id, elem);

        // set scroll event
        elem.addEventListener("scroll", (ev: Event) => {
            syncY.sync<number>(id, elem,
                (e, v) => { e.scrollTop = v; },
                (e) => e.scrollTop);
        });
    }

    initFuncList.push(initSyncScroll);
}