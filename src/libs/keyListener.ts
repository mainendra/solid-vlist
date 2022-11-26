let handlers: ({callback: (event: KeyboardEvent) => boolean|void})[] = [];
let keyListenerEnabled = false;

export function getListenersCount() {
    return handlers.length;
}

function addKeyListener() {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('nativeUiBridge', onNativeEvent)
    setTimeout(() => document.body.focus(), 100);
}

function onNativeEvent(event: any) {
    const { type, data } = event.detail || {};
    if (type) {
        return window.dispatchEvent(new KeyboardEvent(type, data));
    }
}

function onKeyDown(event: KeyboardEvent) {
    for (let i = handlers.length - 1; i >= 0; i--) {
        if (handlers[i] && handlers[i].callback(event)) {
            return;
        }
    }
}

export function subscribeKeyDown(callback: (event: KeyboardEvent) => boolean|void) {
    if (!keyListenerEnabled) {
        addKeyListener();
        keyListenerEnabled = true;
    }

    const handlerObject = { callback };
    handlers.push(handlerObject);

    return () => {
        handlers.splice(handlers.indexOf(handlerObject), 1);
    };
}

