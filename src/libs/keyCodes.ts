export enum KEYS {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    M,
    A,
    SELECT,
};

const KeyCodes: {[key: string]: KEYS} = {
    "ArrowUp": KEYS.UP,
    "ArrowDown": KEYS.DOWN,
    "ArrowLeft": KEYS.LEFT,
    "ArrowRight": KEYS.RIGHT,
    "Enter": KEYS.SELECT,
    "KeyK": KEYS.UP,
    "KeyJ": KEYS.DOWN,
    "KeyH": KEYS.LEFT,
    "KeyL": KEYS.RIGHT,
    "Space": KEYS.SELECT,
    "KEYCODE_DPAD_UP": KEYS.UP,
    "KEYCODE_DPAD_DOWN": KEYS.DOWN,
    "KEYCODE_DPAD_LEFT": KEYS.LEFT,
    "KEYCODE_DPAD_RIGHT": KEYS.RIGHT,
    "KeyM": KEYS.M,
    "KeyA": KEYS.A,
};

export function getKey(event: KeyboardEvent): KEYS {
    return KeyCodes[event.code];
}
