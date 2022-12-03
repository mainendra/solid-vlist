import { createSignal, For, onMount } from "solid-js";
import { getKey, KEYS } from "../../libs/keyCodes";
import { createVirtualList } from "../../libs/virtualList";
import MiniChildBanner from "./MiniBanner";

interface ChildBannerParams {
    index: number;
    focused: boolean;
    width: number;
}

export default function ChildBanner(params: ChildBannerParams) {
    let parentRef: HTMLDivElement | undefined;
    const [parentSize, setParentSize] = createSignal(0);
    const itemSize = () => parentSize() / 5;
    const { list, focusedIndex } = createVirtualList({
        focused: () => params.focused,
        parentSize,
        sizeOfItem: () => itemSize(),
        overscan: 5,
        paddingStart: 50,
        paddingEnd: 50,
        isNext: (event: KeyboardEvent) => getKey(event) === KEYS.DOWN,
        isPrevious: (event: KeyboardEvent) => getKey(event) === KEYS.UP,
        startIndex: 2,
        circular: false,
        fixedFocus: false,
        totalItems: 5,
    });

    const getFocusedIndex = () => params.focused ? focusedIndex() : -1;

    onMount(() => setParentSize(parentRef?.offsetHeight ?? 0));

    return (
        <div ref={parentRef} class="overflow-hidden h-full" style={{width: `${params.width}px`}}>
            <div class="relative flex flex-col h-full w-full border-2 border-solid border-red-500">
                <For each={list()}>
                    {
                        (item) => item.index === 2 ?
                        <div class="flex justify-center items-center" style={{height: `${itemSize()}px`, width: `${params.width}px`}}>
                            <MiniChildBanner index={item.index} focused={params.focused && item.index === focusedIndex()} height={itemSize()} />
                        </div> :
                        <div class="flex justify-center items-center" style={{height: `${itemSize()}px`, width: `${params.width}px`}}>
                            <span class="text-4xl transition-all" classList={{'text-red-500 font-bold scale-125': item.index === getFocusedIndex()}}>{item.index}</span>
                        </div>
                    }
                </For>
            </div>
        </div>
    );
}

