import { Component, createEffect, createSignal, For, onSettled, Show } from 'solid-js';
import Banner from './components/Banner';
import Swimlane from './components/Swimlane';
import { getKey, KEYS } from './libs/keyCodes';
import { createVirtualList } from './libs/virtualList';
import { setRedBg, setShowAll } from './store';

const DELAY_MS = 2000;

// main component
const App: Component = () => {
    let parentRef: HTMLDivElement | undefined;
    const [parentSize, setParentSize] = createSignal(0);
    const { list, listSizePixel, startPosition, isFocused } = createVirtualList({
        parentSize,
        sizeOfItem: (index) => index % 5 === 0 ? 300 : 150,
        overscan: 5,
        paddingStart: 50,
        paddingEnd: 50,
        isNext: (event: KeyboardEvent) => getKey(event) === KEYS.DOWN,
        isPrevious: (event: KeyboardEvent) => getKey(event) === KEYS.UP,
        onKeyDown: (event: KeyboardEvent) => {
            if (getKey(event) === KEYS.M) {
                setRedBg(redBg => !redBg);
                return true;
            } else if (getKey(event) === KEYS.A) {
                setShowAll(showAll => !showAll);
                return true;
            } else {
                setKeyCode(event.code);
            }
            return false;
        },
        startIndex: 0,
        circular: true,
        fixedFocus: false,
        totalItems: 1000,
    });


    const [keyCode, setKeyCode] = createSignal<string>('');
    createEffect(
        () => keyCode(),
        (code) => {
            if (code !== '') {
                const timer = setTimeout(() => {
                    setKeyCode('');
                }, DELAY_MS);
                return () => clearTimeout(timer);
            }
        }
    );

    onSettled(() => { setParentSize(parentRef?.offsetHeight ?? 0); });

    return (
        <div class="relative h-screen w-screen py-20 bg-white">
            <Show when={keyCode() !== ''}>
                <div class="absolute top-[100px] left-[100px] h-[100px] w-[200px] bg-white border-2 rounded-sm flex justify-center items-center z-10">{keyCode()}</div>
            </Show>
            <div ref={parentRef} class="h-full w-full overflow-hidden">
                <div style={{ height: `${listSizePixel()}px`, transform: `translate3d(0, ${-startPosition()}px, 0)` }} class="relative flex flex-col transition-all">
                    <For each={list()}>
                        {
                            (item) => (item.index % 5 === 0) ?
                                <div style={{ top: `${item.start}px` }} class="absolute w-screen"><Banner index={item.index} focused={isFocused(item.index)} /></div> :
                                <div style={{ top: `${item.start}px` }} class="absolute w-screen"><Swimlane index={item.index} focused={isFocused(item.index)} /></div>
                        }
                    </For>
                </div>
            </div>
        </div>
    );
};

export default App;
