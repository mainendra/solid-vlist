import { Accessor, batch, createEffect, createSignal, onCleanup } from "solid-js";
import { subscribeKeyDown } from "./keyListener";
import { createNav } from "./navigation";

interface VirtualListParams {
    parentSize: Accessor<number>;
    totalItems: number,
    sizeOfItem: (index: number) => number;
    overscan?: number;
    paddingStart?: number;
    paddingEnd?: number;
    startIndex?: number;
    circular?: boolean;
    fixedFocus?: boolean,
    isNext?: (event: KeyboardEvent) => boolean;
    isPrevious?: (event: KeyboardEvent) => boolean;
    isSelect?: (event: KeyboardEvent) => boolean;
}

export interface ListItem {
    index: number;
    start: number;
    size: number;
    end: number;
}

interface returnType {
    list: Accessor<ListItem[]>,
    listSizePixel: number,
    startPosition: Accessor<number>,
    focusedIndex: Accessor<number>,
}

function getItemList({totalItems, sizeOfItem}: VirtualListParams) {
    const list = [];
    let totalSize = 0;
    for (let i = 0; i < totalItems; i++) {
        const itemSize = sizeOfItem(i);
        list.push({
            index: i,
            start: totalSize,
            size: itemSize,
            end: totalSize + itemSize,
        });
        totalSize += itemSize;
    }

    return { listSizePixel: totalSize, itemList: list };
}

interface GetSlicedListParam extends VirtualListParams {
    itemList: ListItem[],
    startPos: number,
    endPos: number,
}

function getSlicedList({ overscan = 0, itemList, startPos, endPos }: GetSlicedListParam): ListItem[] {
    const startIndex = itemList.find(item => item.start > startPos)?.index ?? 0;
    const endIndex = itemList.find(item => item.end >= endPos)?.index ?? itemList.length - 1;
    return itemList.slice(Math.max(0, (startIndex - overscan)), Math.min(itemList.length, endIndex + overscan));
}

// Use in component
export function createVirtualList(params: VirtualListParams): returnType {
    const { isNext, isPrevious, isSelect, totalItems, startIndex = 0, circular = false, fixedFocus = false, paddingStart = 0, paddingEnd = 0, parentSize } = params;
    const { listSizePixel, itemList } = getItemList(params);
    const { position, next, previous } = createNav({ start: 0, end: totalItems - 1, current: startIndex, circular: circular });

    const [list, setList] = createSignal<ListItem[]>([]);
    const [startPosition, setStartPosition] = createSignal(paddingStart);
    createEffect<number>((prevStart) => {
        const item = itemList[position()];

        const itemStart = item.start - paddingStart;
        const itemEnd = item.start + item.size + paddingEnd;
        const prevEnd = prevStart + parentSize();

        let result = prevStart;
        if (fixedFocus) {
            result = item.start - paddingStart;
        } else if (itemStart < prevStart) { // before
            result = itemStart;
        } else if (itemEnd >= prevEnd) { // after
            result = Math.max(0, itemEnd - parentSize())
        }

        batch(() => {
            setStartPosition(result);
            setList(getSlicedList({ ...params, startPos: result, endPos: (result + parentSize()), itemList }));
        });

        return result;
    }, -paddingStart);

    const onKeyDown = (event: KeyboardEvent) => {
        if (isNext?.(event)) {
            event.preventDefault();
            next();
            return true;
        }

        if (isPrevious?.(event)) {
            event.preventDefault();
            previous();
            return true;
        }

        if (isSelect?.(event)) {
            event.preventDefault();
            return true;
        }

        return false;
    };

    const cleanup = subscribeKeyDown(onKeyDown);
    onCleanup(cleanup);

    return { list, listSizePixel, startPosition, focusedIndex: position };
}
