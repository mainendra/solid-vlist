import { createSignal } from "solid-js";

export const [redBg, setRedBg] = createSignal<boolean>(false);
export const [showAll, setShowAll] = createSignal<boolean>(false);

export const [keyCode, setKeyCode] = createSignal<string>('');
