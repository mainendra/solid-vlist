import { createSignal, For, onSettled } from "solid-js";
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
    const { list, isFocused } = createVirtualList({
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

    const getIsFocused = (index: number) => params.focused && isFocused(index);

    onSettled(() => { setParentSize(parentRef?.offsetWidth ?? 0); });

    return (
        <div ref={parentRef} class="h-[300px] mx-20 overflow-hidden">
            <div class="relative flex h-full w-full border-2 border-solid border-blue-500">
                <For each={list()}>
                    {
                        (item) =>
                            item.index === 3 ?
                            <div class="h-[300px] flex justify-center items-center" style={{width: `${itemSize()}px`}}>
                                <ChildBanner index={item.index} focused={getIsFocused(item.index)} width={itemSize()} />
                            </div> :
                            item.index === 1 ?
                            <div class="h-[300px] flex justify-center items-center" style={{width: `${itemSize()}px`}}>
                                <SquareBanner index={item.index} focused={getIsFocused(item.index)} width={itemSize()} />
                            </div> :
                            <div class="h-[300px] flex justify-center items-center" style={{width: `${itemSize()}px`}}>
                                <span class={["text-4xl transition-all", {'text-red-500 font-bold scale-125': getIsFocused(item.index)}]}>{item.index}</span>
                            </div>
                    }
                </For>
            </div>
        </div>
    );
}
