import { createSignal, For, onMount } from "solid-js";
import { createVirtualList } from "../libs/virtualList";

interface BannerParams {
    index: number;
    focused: boolean;
}

interface ChildBannerParams extends BannerParams {
    width: number;
}

interface MiniChildBannerParams extends BannerParams {
    height: number;
}

function MiniChildBanner(params: MiniChildBannerParams) {
    let parentRef: HTMLDivElement | undefined;
    const [parentSize, setParentSize] = createSignal(0);
    const itemSize = () => parentSize() / 5;
    const { list, focusedIndex } = createVirtualList({
        parentSize,
        sizeOfItem: () => itemSize(),
        overscan: 5,
        paddingStart: 50,
        paddingEnd: 50,
        isNext: (event: KeyboardEvent) => params.focused && ["ArrowRight", "KEYCODE_DPAD_RIGHT"].includes(event.code),
        isPrevious: (event: KeyboardEvent) => params.focused && ["ArrowLeft", "KEYCODE_DPAD_LEFT"].includes(event.code),
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
                            <span classList={{'text-red-500 text-2xl font-bold scale-125': item.index === getFocusedIndex()}}>{item.index}</span>
                        </div>
                    }
                </For>
            </div>
        </div>
    );
}

function ChildBanner(params: ChildBannerParams) {
    let parentRef: HTMLDivElement | undefined;
    const [parentSize, setParentSize] = createSignal(0);
    const itemSize = () => parentSize() / 5;
    const { list, focusedIndex } = createVirtualList({
        parentSize,
        sizeOfItem: () => itemSize(),
        overscan: 5,
        paddingStart: 50,
        paddingEnd: 50,
        isNext: (event: KeyboardEvent) => params.focused && ["ArrowDown", "KEYCODE_DPAD_DOWN"].includes(event.code),
        isPrevious: (event: KeyboardEvent) => params.focused && ["ArrowUp", "KEYCODE_DPAD_UP"].includes(event.code),
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
                            <span classList={{'text-red-500 text-2xl font-bold scale-125': item.index === getFocusedIndex()}}>{item.index}</span>
                        </div>
                    }
                </For>
            </div>
        </div>
    );
}

export default function Banner(params: BannerParams) {
    let parentRef: HTMLDivElement | undefined;
    const [parentSize, setParentSize] = createSignal(0);
    const itemSize = () => parentSize() / 5;
    const { list, focusedIndex } = createVirtualList({
        parentSize,
        sizeOfItem: () => itemSize(),
        overscan: 5,
        paddingStart: 50,
        paddingEnd: 50,
        isNext: (event: KeyboardEvent) => params.focused && ["ArrowRight", "KEYCODE_DPAD_RIGHT"].includes(event.code),
        isPrevious: (event: KeyboardEvent) => params.focused && ["ArrowLeft", "KEYCODE_DPAD_LEFT"].includes(event.code),
        startIndex: 0,
        circular: true,
        fixedFocus: false,
        totalItems: 5,
    });

    const getFocusedIndex = () => params.focused ? focusedIndex() : -1;

    onMount(() => setParentSize(parentRef?.offsetWidth ?? 0));

    return (
        <div ref={parentRef} class="h-[300px] mx-20 overflow-hidden">
            <div class="relative flex transition-all h-full w-full border-2 border-solid border-blue-500">
                <For each={list()}>
                    {
                        (item) =>
                            item.index === 3 ?
                            <div class="h-[300px] flex justify-center items-center transition-all" style={{width: `${itemSize()}px`}}>
                                <ChildBanner index={item.index} focused={params.focused && item.index === focusedIndex()} width={itemSize()} />
                            </div> :
                            <div class="h-[300px] flex justify-center items-center transition-all" style={{width: `${itemSize()}px`}}>
                                <span classList={{'text-red-500 text-2xl font-bold scale-125': item.index === getFocusedIndex()}}>{item.index}</span>
                            </div>
                    }
                </For>
            </div>
        </div>
    );
}
