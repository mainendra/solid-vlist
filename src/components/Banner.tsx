import { createSignal, For, onMount } from "solid-js";
import { createVirtualList } from "../libs/virtualList";

interface BannerParams {
    index: number;
    focused: boolean;
}

export default function Banner(params: BannerParams) {
    let parentRef: HTMLDivElement | undefined;
    const [parentSize, setParentSize] = createSignal(0);
    const { list, listSizePixel, startPosition, focusedIndex } = createVirtualList({
        parentSize,
        sizeOfItem: () => 200,
        overscan: 5,
        paddingStart: 50,
        paddingEnd: 50,
        isNext: (event: KeyboardEvent) => params.focused && ["ArrowRight", "KEYCODE_DPAD_RIGHT"].includes(event.code),
        isPrevious: (event: KeyboardEvent) => params.focused && ["ArrowLeft", "KEYCODE_DPAD_LEFT"].includes(event.code),
        startIndex: 0,
        circular: false,
        fixedFocus: true,
        totalItems: 1000,
    });

    const getFocusedIndex = () => params.focused ? focusedIndex() : -1;

    onMount(() => setParentSize(parentRef?.offsetWidth ?? 0));

    return (
        <div ref={parentRef} class="h-[200px] border-solid border-2 mx-20 overflow-hidden">
            <div style={{ width: `${listSizePixel}px`, transform: `translateX(${-startPosition()}px)` }} class="relative flex transition-all">
                <For each={list()}>
                    {
                        (item) =>
                        <div class="w-[200px] h-[200px] flex justify-center items-center transition-all absolute" classList={{'scale-125': item.index === getFocusedIndex()}} style={{ left: `${item.start}px` }}>
                            <img src={`https://picsum.photos/seed/${params.index}${item.index}/150`} alt={`r${item.start}c${item.index}`}  classList={{'border-solid border-2 border-red-500': item.index === getFocusedIndex()}} />
                        </div>
                    }
                </For>
            </div>
        </div>
    );
}
