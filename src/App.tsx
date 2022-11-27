import { Component, createSignal, For, onMount } from 'solid-js';
import { lazy } from "solid-js";
import { createVirtualList } from './libs/virtualList';

const Banner = lazy(() => import('./components/Banner'));
const Swimlane = lazy(() => import('./components/Swimlane'));

const App: Component = () => {
    let parentRef: HTMLDivElement | undefined;
    const [parentSize, setParentSize] = createSignal(0);
    const { list, listSizePixel, startPosition, focusedIndex } = createVirtualList({
        parentSize,
        sizeOfItem: (index) => index % 5 === 0 ? 300 : 150,
        overscan: 5,
        paddingStart: 50,
        paddingEnd: 50,
        isNext: (event: KeyboardEvent) => ["ArrowDown", "KEYCODE_DPAD_DOWN"].includes(event.code),
        isPrevious: (event: KeyboardEvent) => ["ArrowUp", "KEYCODE_DPAD_UP"].includes(event.code),
        startIndex: 0,
        circular: false,
        fixedFocus: true,
        totalItems: 1000,
    });

    onMount(() => setParentSize(parentRef?.offsetHeight ?? 0));

    return (
        <div class="relative h-screen w-screen py-20 bg-white">
            <div ref={parentRef} class="h-full w-full overflow-hidden">
                <div style={{ height: `${listSizePixel}px`, transform: `translate3d(0, ${-startPosition()}px, 0)` }} class="relative flex flex-col transition-all">
                    <For each={list()}>
                        {
                            (item) => (item.index % 5 === 0) ?
                                <div style={{ top: `${item.start}px` }} class="absolute w-screen"><Banner index={item.index} focused={item.index === focusedIndex()} /></div> :
                                <div style={{ top: `${item.start}px` }} class="absolute w-screen"><Swimlane index={item.index} focused={focusedIndex() === item.index} /></div>
                        }
                    </For>
                </div>
            </div>
        </div>
    );
};

export default App;
