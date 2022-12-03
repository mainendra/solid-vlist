import { createSignal } from "solid-js";
import { getKey, KEYS } from "../../libs/keyCodes";
import { createKeyNav } from "../../libs/navigation";

interface ChildBannerParams {
    index: number;
    focused: boolean;
    width: number;
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

export default function SquareBanner(params: ChildBannerParams) {
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

