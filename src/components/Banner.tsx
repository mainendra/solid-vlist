import { createSignal, For, onMount } from "solid-js";
import { getKey, KEYS } from "../libs/keyCodes";
import { createKeyNav } from "../libs/navigation";
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

interface StateType {
    [key: string]: {
        [key: string]: number;
    };
};

const stateMachine: StateType = {
    1 : {
        'right': 2,
        'down': 3,
    },
    2: {
        'left': 1,
        'down': 4,
    },
    3: {
        'right': 4,
        'up': 1,
    },
    4: {
        'left': 3,
        'up': 2,
    },
};

function SquareBanner(params: ChildBannerParams) {
    const [focusedIndex, setFocusedIndex] = createSignal<number>(1);
    createKeyNav({
        onKeyDown: (event) => {
            const index = focusedIndex();
            if (getKey(event) === KEYS.RIGHT && stateMachine[index]['right']) {
                setFocusedIndex(stateMachine[index]['right']);
                return true;
            }
            if (getKey(event) === KEYS.LEFT && stateMachine[index]['left']) {
                setFocusedIndex(stateMachine[index]['left']);
                return true;
            }
            if (getKey(event) === KEYS.DOWN && stateMachine[index]['down']) {
                setFocusedIndex(stateMachine[index]['down']);
                return true;
            }
            if (getKey(event) === KEYS.UP && stateMachine[index]['up']) {
                setFocusedIndex(stateMachine[index]['up']);
                return true;
            }

            return false;
        },
        focused: () => params.focused,
    });

    const itemSize = () => (params.width / 2) - 4; // 2px border

    return (
        <div style={{height: `${params.width}px`, width: `${params.width}px`}} class="flex flex-wrap">
            <span style={{height: `${itemSize()}px`, width: `${itemSize()}px`}} class="flex justify-center items-center border-2 border-purple-600" classList={{'text-red-500 text-2xl font-bold': params.focused && focusedIndex() === 1}}>1</span>
            <span style={{height: `${itemSize()}px`, width: `${itemSize()}px`}} class="flex justify-center items-center border-2 border-purple-600" classList={{'text-red-500 text-2xl font-bold': params.focused && focusedIndex() === 2}}>2</span>
            <span style={{height: `${itemSize()}px`, width: `${itemSize()}px`}} class="flex justify-center items-center border-2 border-purple-600" classList={{'text-red-500 text-2xl font-bold': params.focused && focusedIndex() === 3}}>3</span>
            <span style={{height: `${itemSize()}px`, width: `${itemSize()}px`}} class="flex justify-center items-center border-2 border-purple-600" classList={{'text-red-500 text-2xl font-bold': params.focused && focusedIndex() === 4}}>4</span>
        </div>
    );
}

function MiniChildBanner(params: MiniChildBannerParams) {
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

function ChildBanner(params: ChildBannerParams) {
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
