import { createSignal, For, onSettled } from "solid-js";
import { getKey, KEYS } from "../libs/keyCodes";
import { createVirtualList } from "../libs/virtualList";
import { redBg, showAll } from "../store";

interface SwimlaneParams {
    index: number;
    focused: boolean;
}

export default function Swimlane(params: SwimlaneParams) {
    let parentRef: HTMLDivElement | undefined;
    const [parentSize, setParentSize] = createSignal(0);
    const { list, listSizePixel, startPosition, isFocused } = createVirtualList({
        focused: () => params.focused,
        parentSize,
        sizeOfItem: () => 150,
        overscan: 5,
        paddingStart: 50,
        paddingEnd: 50,
        isNext: (event: KeyboardEvent) => getKey(event) === KEYS.RIGHT,
        isPrevious: (event: KeyboardEvent) => getKey(event) === KEYS.LEFT,
        startIndex: 0,
        circular: true,
        fixedFocus: false,
        totalItems: 1000,
    });

    const getIsFocused = (index: number) => params.focused && isFocused(index);

    onSettled(() => { setParentSize(parentRef?.offsetWidth ?? 0); });

    return (
        <div ref={parentRef} class="h-[150px] mx-20 overflow-hidden">
            <div style={{ width: `${listSizePixel()}px`, transform: `translate3d(${-startPosition()}px, 0, 0)` }} class="relative flex transition-all">
                <For each={list()}>
                    {
                        (item) =>
                        <div class={["w-[150px] h-[150px] flex justify-center items-center transition-all absolute", {'scale-125': getIsFocused(item.index)}]} style={{ left: `${item.start}px` }}>
                            <span class={["absolute rounded-sm p-2", {'invisible': (!getIsFocused(item.index) && showAll() === false), 'bg-white': redBg() === false, 'bg-red-300': redBg() === true}]}>{params.index + 1} / {item.index + 1}</span>
                            <img src={`https://picsum.photos/seed/${params.index}${item.index}/100`} alt={`r${item.start}c${item.index}`} class={["w-[100px] h-[100px] bg-gray-500", {'border-solid border-2 border-red-500': getIsFocused(item.index)}]} />
                        </div>
                    }
                </For>
            </div>
        </div>
    );
}
