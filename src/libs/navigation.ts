import { Accessor, createEffect, createSignal } from "solid-js";
import { subscribeKeyDown } from "./keyListener";

export interface NavProps {
    start: number,
    end: number,
    current: number,
    circular: boolean,
}

export interface NavControls {
    position: Accessor<number>,
    next: () => boolean,
    previous: () => boolean,
    goTo: (pos: number) => void
}

export function createNav({ start, end, current, circular }: NavProps): NavControls {
    const [position, setPosition] = createSignal(current);

    const next = () => {
        if (position() + 1 <= end) {
            setPosition((lastPos) => lastPos + 1);
            return true;
        }

        if (circular) {
            setPosition(start);
            return true;
        }

        return false;
    };

    const previous = () => {
        if (position() - 1 >= start) {
            setPosition((lastPos) => lastPos - 1);
            return true;
        }

        if (circular) {
            setPosition(end);
            return true;
        }

        return false;
    };

    const goTo = (pos: number) => {
        if (pos >= start && pos <= end) {
            setPosition(pos);
        }
    };

    return { position, next, previous, goTo };
}

interface KeyNavParams {
    onKeyDown: (event: KeyboardEvent) => boolean;
    focused?: Accessor<boolean>;
}
export function createKeyNav(params: KeyNavParams) {
    createEffect(
        () => params.focused?.() ?? true,
        (focused) => {
            if (focused) {
                return subscribeKeyDown(params.onKeyDown);
            }
        }
    );
}
