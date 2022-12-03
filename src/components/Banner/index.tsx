import { createSignal, For, onMount } from "solid-js";
import { getKey, KEYS } from "../../libs/keyCodes";
import { createVirtualList } from "../../libs/virtualList";
import ChildBanner from "./ChildBanner";
import SquareBanner from "./SquareBanner";

interface BannerParams {
    index: number;
    focused: boolean;
}

export default function Banner(params: BannerParams) {
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
        startIndex: 0,
        circular: true,
        fixedFocus: false,
        totalItems: 5,
    });

    const getFocusedIndex = () => params.focused ? focusedIndex() : -1;

    onMount(() => setParentSize(parentRef?.offsetWidth ?? 0));

    return (
        <div ref={parentRef} class="h-[300px] mx-20 overflow-hidden">
            <div class="relative flex h-full w-full border-2 border-solid border-blue-500">
                <For each={list()}>
                    {
                        (item) =>
                            item.index === 3 ?
                            <div class="h-[300px] flex justify-center items-center" style={{width: `${itemSize()}px`}}>
                                <ChildBanner index={item.index} focused={params.focused && item.index === focusedIndex()} width={itemSize()} />
                            </div> :
                            item.index === 1 ?
                            <div class="h-[300px] flex justify-center items-center" style={{width: `${itemSize()}px`}}>
                                <SquareBanner index={item.index} focused={params.focused && item.index === focusedIndex()} width={itemSize()} />
                            </div> :
                            <div class="h-[300px] flex justify-center items-center" style={{width: `${itemSize()}px`}}>
                                <span class="text-4xl transition-all" classList={{'text-red-500 font-bold scale-125': item.index === getFocusedIndex()}}>{item.index}</span>
                            </div>
                    }
                </For>
            </div>
        </div>
    );
}
