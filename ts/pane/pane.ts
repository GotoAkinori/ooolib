namespace ooo.pane {
    // #region Constants
    const PANE_PARENT = "ooo_pane_box";
    const PANE_QUERY = "*[data-" + PANE_PARENT + "]";
    const PANE_CHILD_INFO = "ooo_pane_child";

    const PANE_SUB_CLASS_X = "ooo_pane_subx";
    const PANE_SUB_CLASS_Y = "ooo_pane_suby";

    const PANE_SPLIT_CLASS_X = "ooo_pane_splitx";
    const PANE_SPLIT_CLASS_Y = "ooo_pane_splity";

    // #endregion

    // #region PaneInfo
    class PaneInfo {
        level: number = 0;
        ratio: number = 1;
        size: number = -1;
        min_size: number = 0;
    }

    /**
     * Convert information string to object.
     * @param paneInfoString string set in "data-ooo_pane_box".
     * @returns Information of the pane.
     */
    function getPaneInfo(elem: HTMLElement): PaneInfo {
        let info: PaneInfo = new PaneInfo;
        let infoStr = elem.dataset[PANE_CHILD_INFO];
        if (infoStr !== undefined) {
            setObjectValue(info, infoStr);
        }
        return info;
    }

    // #endregion

    // #region initialization

    /** 
     * init function for pane
     */
    function initPane() {
        let paneObjects: Pane[] = [];

        // ============================
        // make Pane
        // ============================
        let panes = document.querySelectorAll(PANE_QUERY);
        panes.forEach((elem: Element, i: number) => {
            if (elem instanceof HTMLElement) {
                let type = elem.dataset[PANE_PARENT];
                switch (type) {
                    case "x": {
                        paneObjects.push(new Pane(elem, true));
                    } break;
                    case "y": {
                        paneObjects.push(new Pane(elem, false));
                    } break;
                    default: {
                        console.group("[OOO ERROR] [pane]");
                        console.error(elem);
                        console.error(`Invalidate value "${type}" is defined as "${PANE_PARENT}" value.`);
                        console.error(`"x" or "y" is valid.`);
                        console.groupEnd();
                    } break;
                }
            }
        });

        // ============================
        // make pane tree structure.
        // ============================
        let getPane = (elem: HTMLElement) => {
            for (let pane of paneObjects) {
                if (pane.htmlElement === elem) {
                    return pane;
                }
            }
            return null;
        };
        for (let pane of paneObjects) {
            // get parent pane
            let parent = pane.htmlElement.parentElement!.closest(PANE_QUERY);
            if (!(parent instanceof HTMLElement)) {
                Pane.rootPanes.push(pane);
                continue;
            }

            let parentPane = getPane(parent);
            if (parentPane === null) {
                Pane.rootPanes.push(pane);
                continue;
            }

            // construct tree
            parentPane.childPane.push(pane);
            pane.parentPane = parentPane;
        }

        // ============================
        // set pane size.
        // ============================
        Pane.forEach(pane => {
            pane.initSize();
            return true;
        });
    };

    // #endregion

    /**
     * Class of Pane.
     */
    class Pane {
        // #region member variables

        // information of sub pane.
        private children: HTMLElement[] = [];
        private childrenInfo: PaneInfo[] = [];

        // information of splitters
        private splitters: HTMLDivElement[] = [];

        // information of pane.
        public readonly htmlElement: HTMLElement;
        public readonly isX: boolean;

        public minSize = 0;
        public splitterSize = 10;
        public levels: sortedArray = new sortedArray();

        // information of inter-pane.
        public childPane: Pane[] = [];
        public parentPane: Pane | null = null;

        // #endregion

        // #region init

        public constructor(elem: HTMLElement, isX: boolean) {
            this.htmlElement = elem;
            this.isX = isX;

            // get children.
            {
                elem.childNodes.forEach((subItem, key) => {
                    if (subItem instanceof HTMLElement) {
                        this.children.push(subItem);
                        this.childrenInfo.push(getPaneInfo(subItem));

                        subItem.classList.add(
                            this.isX ? PANE_SUB_CLASS_X : PANE_SUB_CLASS_Y
                        );
                    }
                });
            }

            // calculate min size.
            {
                this.minSize = 0;
                for (let info of this.childrenInfo) {
                    this.minSize += info.min_size;
                }

                this.minSize += this.splitterSize * (this.children.length - 1);
                if (this.isX) {
                    this.htmlElement.style.minWidth = this.minSize + "px";
                } else {
                    this.htmlElement.style.minHeight = this.minSize + "px";
                }
            }

            // get levels
            {
                for (let info of this.childrenInfo) {
                    this.levels.add(info.level);
                }
            }

            // make splitters
            {
                for (let i = 0; i < this.children.length - 1; i++) {
                    let splitter = document.createElement("div");
                    splitter.classList.add(
                        this.isX ? PANE_SPLIT_CLASS_X : PANE_SPLIT_CLASS_Y);
                    this.setSize(splitter, this.splitterSize);
                    this.splitters.push(splitter);
                    this.htmlElement.appendChild(splitter);

                    splitter.addEventListener("mousedown", (ev: MouseEvent) => {
                        this.splitterDragStart(ev, i);
                    });
                }
            }
        }

        public initSize() {
            // get sum of size and ratio
            let size = this.getHtmlSize(this.htmlElement);
            let sumSize = 0;
            let sumRatio = 0;
            for (let info of this.childrenInfo) {
                if (info.size >= 0) {
                    sumSize += info.size;
                } else {
                    sumRatio += info.ratio;
                }
            }
            sumSize += this.splitterSize * (this.children.length - 1);

            // calculate sub pane size
            let childSize: number[] = [];
            let sub = size - sumSize;
            for (let info of this.childrenInfo) {
                if (info.size >= 0) {
                    childSize.push(info.size);
                } else {
                    childSize.push(sub * info.ratio / sumRatio);
                }
            }

            // set splitter position
            let pos = 0;
            for (let i = 0; i < this.children.length; i++) {
                this.setStartPos(this.children[i], pos);

                pos += childSize[i];
                this.setEndPos(this.children[i], size - pos);

                // set splitter position.
                // (if it is last pane, splitter next to this is not exist.)
                if (i < this.children.length - 1) {
                    this.setStartPos(this.splitters[i], pos);
                }

                pos += this.splitterSize;
            }
        }

        // #endregion

        // #region Drag & Drop

        private prevSize: number[] = [];
        private splitterDragStart(ev: MouseEvent, i: number) {
            let size = this.getHtmlSize(this.htmlElement);

            // show range
            let base = document.createElement("div");
            let line = document.createElement("div");
            base.classList.add("ooo_pane_drag_base");
            line.classList.add("ooo_pane_drag_base_line");
            if (this.isX) {
                line.style.height = "100%";
                line.style.width = this.splitterSize + "px"
                line.style.top = "0px";
            } else {
                line.style.width = "100%";
                line.style.height = this.splitterSize + "px"
                line.style.left = "0px";
            }

            this.htmlElement.appendChild(base);
            base.appendChild(line);

            // calculate position range
            let posMin = 0;
            let posMax = 0;
            {
                let sum = 0;
                for (let j = 0; j <= i; j++) {
                    sum += this.childrenInfo[j].min_size;
                }
                posMin = sum + (i + 1 / 2) * this.splitterSize;
            }
            {
                let sum = 0;
                for (let j = i + 1; j < this.children.length; j++) {
                    sum += this.childrenInfo[j].min_size;
                }
                posMax = size - sum - (this.children.length - i - 2 + 1 / 2) * this.splitterSize;
            }

            // keep current ratio
            this.prevSize.length = 0;
            for (let subPane of this.children) {
                this.prevSize.push(this.getHtmlSize(subPane));
            }

            // on splitter resize end
            base.addEventListener("mouseup", (ev) => {
                let mousePos = this.getMousePos(ev);
                let splitterPos = restrict(mousePos, posMin, posMax);

                base.remove();
                line.remove();

                this.calculate(
                    0, i,
                    splitterPos - this.splitterSize / 2,
                    0);
                this.calculate(
                    i + 1, this.children.length - 1,
                    size - splitterPos - this.splitterSize / 2,
                    splitterPos + this.splitterSize / 2);
                this.setStartPos(this.splitters[i], splitterPos - this.splitterSize / 2);
            });
            base.addEventListener("mousemove", (ev) => {
                let mousePos = this.getMousePos(ev);
                let splitterPos = restrict(mousePos, posMin, posMax);

                this.setStartPos(line, splitterPos - this.splitterSize / 2);
            });
        }

        private calculate(start: number, end: number, size: number, startPos: number) {
            let parentSize = this.getHtmlSize(this.htmlElement);

            let iLevel = this.levels.array.length - 1;

            while (iLevel >= 0) {
                let level = this.levels.array[iLevel];

                // check if calculate splitter size is well or not.
                let sum_size = 0;
                let sum_ratio = 0;
                let sum_check = 0;
                let ratioIndexList: number[] = [];
                let sizeList: number[] = [];
                let bHit = false;
                for (let i = start; i <= end; i++) {
                    if (this.childrenInfo[i].level == level) {
                        sum_ratio += this.prevSize[i];
                        sum_check += this.childrenInfo[i].min_size;
                        ratioIndexList.push(i);
                        bHit = true;
                    } else if (this.childrenInfo[i].level > level) {
                        sizeList[i] = this.childrenInfo[i].min_size;
                        sum_size += sizeList[i];
                        sum_check += sizeList[i];
                    } else {
                        sizeList[i] = this.prevSize[i];
                        sum_size += sizeList[i];
                        sum_check += sizeList[i];
                    }
                }
                if (sum_check > size || bHit == false) {
                    iLevel--;
                    continue;
                }

                // debug
                console.log("---------------");
                console.log("level: " + level);
                console.log("size: " + size);
                console.log("sizeList");
                console.log(sizeList);
                console.log("prevSize");
                console.log(this.prevSize);
                console.log("ratioIndexList");
                console.log(ratioIndexList);

                // calculate position
                sum_size += (end - start) * this.splitterSize;

                let bLoop: boolean = true;
                let ___counter = 0;
                while (bLoop) {
                    if (___counter++ >= 10000) { alert("Maybe infinite loop"); throw "error"; }
                    bLoop = false;
                    for (let ii = 0; ii < ratioIndexList.length; ii++) {
                        let i = ratioIndexList[ii];
                        let new_size = (size - sum_size) * this.prevSize[i] / sum_ratio;

                        if (new_size < this.childrenInfo[i].min_size) {
                            sum_size += this.childrenInfo[i].min_size;
                            sum_ratio -= this.prevSize[i];
                            sizeList[i] = this.childrenInfo[i].min_size;
                            ratioIndexList.splice(ii, 1);
                            bLoop = true;
                            break;
                        } else {
                            sizeList[i] = new_size;
                        }
                    }
                }

                // set size
                console.log("sizeList -2");
                console.log(sizeList);

                let pos = startPos;
                for (let i = start; i <= end; i++) {
                    this.setStartPos(this.children[i], pos);
                    pos += sizeList[i];
                    this.setEndPos(this.children[i], parentSize - pos);

                    if (i < end) {
                        this.setStartPos(this.splitters[i], pos);
                        pos += this.splitterSize;
                    }
                }

                return;
            }

            console.group("[OOO ERROR] [pane]");
            console.warn("Uncalculatable size is assigned.");
            console.warn(`start: ${start}, end: ${end}, size: ${size}`);
            console.warn(this.childrenInfo);
            console.trace();
            console.groupEnd();

            return;
        }

        public onResize(isX: boolean) {
            if (isX == this.isX) {
                let size = this.getHtmlSize(this.htmlElement);
                this.calculate(0, this.children.length - 1, size, 0);
            }

            for (let child of this.childPane) {
                child.onResize(isX);
            }
        }

        // #endregion

        // #region x, y switch function
        private getHtmlSize(element: HTMLElement): number {
            let rect = element.getBoundingClientRect();
            return this.isX ? rect.width : rect.height;
        }

        private setStartPos(element: HTMLElement, v: number) {
            if (this.isX) {
                element.style.left = v + "px";
            } else {
                element.style.top = v + "px";
            }
        }
        private setEndPos(element: HTMLElement, v: number) {
            if (this.isX) {
                element.style.right = v + "px";
            } else {
                element.style.bottom = v + "px";
            }
        }
        private setSize(element: HTMLElement, v: number) {
            if (this.isX) {
                element.style.width = v + "px";
            } else {
                element.style.height = v + "px";
            }
        }
        private getMousePos(ev: MouseEvent): number {
            let rect = (ev.target as HTMLElement).getBoundingClientRect();
            return this.isX ?
                rect.left + ev.offsetX - this.htmlElement.getBoundingClientRect().left :
                rect.top + ev.offsetY - this.htmlElement.getBoundingClientRect().top;
        }

        // #endregion

        // #region static variables, functions
        public static rootPanes: Pane[] = [];

        /**
         * traverse tree items
         * @param callback function to do. Type is "(pane:Pane) => boolean". please return "false" if you don't want traverse it's child any more.
         * @param order true: pre-order(default) / false: post-order
         * @param parent parent item traversed. if "undefined", traverse all items.
         */
        public static forEach(
            callback: (pane: Pane) => boolean,
            order: boolean = true,
            parent?: Pane
        ) {
            if (parent !== undefined) {
                if (order) { callback(parent); }

                for (let pane of parent.childPane) {
                    Pane.forEach(callback, order, pane);
                }

                if (!order) { callback(parent); }
            } else {
                for (let pane of Pane.rootPanes) {
                    Pane.forEach(callback, order, pane);
                }
            }
        }
        // #endregion
    }

    initFuncList.push(initPane);
}
