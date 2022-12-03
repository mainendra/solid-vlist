import { createSignal, For, onMount } from "solid-js";
import { getKey, KEYS } from "../../libs/keyCodes";
import { createVirtualList } from "../../libs/virtualList";

interface MiniChildBannerParams {
    index: number;
    focused: boolean;
    height: number;
}

export default function MiniChildBanner(params: MiniChildBannerParams) {
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
        isNext: (event: KeyboardEvent) => getKey(event) === KEYS.RIGHT,
        isPrevious: (event: KeyboardEvent) => getKey(event) === KEYS.LEFT,
        startIndex: 2,
        circular: false,
        fixedFocus: false,
        totalItems: 5,
    });

    const getFocusedIndex = () => params.focused ? focusedIndex() : -1;

    onMount(() => setParentSize(parentRef?.offsetHeight ?? 0));

    return (
        <div ref={parentRef} class="overflow-hidden w-full" style={{height: `${params.height}px`}}>
            <div class="relative flex h-full w-full border-2 border-solid border-green-500">
                <For each={list()}>
                    {
                        (item) =>
                        <div class="flex justify-center items-center" style={{width: `${params.height}px`, height: `${params.height}px`}}>
                            <span class="text-2xl transition-all" classList={{'text-red-500 font-bold scale-125': item.index === getFocusedIndex()}}>{item.index}</span>
                        </div>
                    }
                </For>
            </div>
        </div>
    );
}

