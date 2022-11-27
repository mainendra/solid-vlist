export enum KEYS {
    UP,
    DOWN,
    LEFT,
    RIGHT,
};

const KeyCodes: {[key: string]: KEYS} = {
    "ArrowUp": KEYS.UP,
    "ArrowDown": KEYS.DOWN,
    "ArrowLeft": KEYS.LEFT,
    "ArrowRight": KEYS.RIGHT,
    "KEYCODE_DPAD_UP": KEYS.UP,
    "KEYCODE_DPAD_DOWN": KEYS.DOWN,
    "KEYCODE_DPAD_LEFT": KEYS.LEFT,
    "KEYCODE_DPAD_RIGHT": KEYS.RIGHT,
};

export function getKey(event: KeyboardEvent): KEYS {
    return KeyCodes[event.code];
}
