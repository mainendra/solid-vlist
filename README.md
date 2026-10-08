# solid-vlist

A **virtual (windowed) list** built with [SolidJS](https://www.solidjs.com/), designed for
**spatial keyboard / D-pad navigation** — the kind of UI you find on a TV or set-top box.

It renders a vertical list of **1000 rows**, where every row is itself a nested, independently
navigable virtual list. Only the items currently visible in the viewport are rendered to the DOM,
so the list stays fast regardless of how many items it logically contains.

> Built on Solid **2.x**, Vite, and Tailwind CSS v4.

## Output

<img src="output.png" width="600px">

---

## What makes it interesting

- **Virtualization** — thousands of items, but only the visible window (plus a small overscan) is in the DOM.
- **Spatial navigation** — arrow keys, `hjkl` (vim), and Android TV D-pad codes all move a focus cursor.
- **Arbitrary nesting** — a list item can contain another virtual list, which can contain another, and so on.
- **Focus isolation** — only the currently focused list responds to key presses, via a stacked global key dispatcher.
- **Fine-grained reactivity** — moving focus only updates the two items whose highlight changes, not the whole list.

### Controls

| Key(s)                          | Action                                  |
| ------------------------------- | --------------------------------------- |
| `↑` `↓` / `K` `J`               | Move focus up / down (vertical lists)   |
| `←` `→` / `H` `L`               | Move focus left / right (swimlanes)     |
| `Enter` / `Space`               | Select (reserved)                       |
| `M`                             | Toggle red background on labels         |
| `A`                             | Toggle "show all labels" vs focused-only |

D-pad key codes (`KEYCODE_DPAD_*`) are also mapped for TV remotes.

---

## Project structure

```
src/
├── index.tsx               # App entry — mounts <App> into #root
├── App.tsx                 # Root vertical virtual list (1000 rows)
├── store.ts                # Global UI signals (redBg, showAll)
├── index.css               # Tailwind import
│
├── components/
│   ├── Swimlane.tsx        # A horizontal virtual list of 1000 items
│   └── Banner/
│       ├── index.tsx       # A 5-cell banner row (every 5th App row)
│       ├── ChildBanner.tsx # Nested vertical list inside a banner cell
│       ├── MiniBanner.tsx  # Nested horizontal list inside a child banner
│       └── SquareBanner.tsx# A 2×2 grid driven by a focus state machine
│
└── libs/
    ├── virtualList.ts      # createVirtualList — the windowing engine
    ├── navigation.ts       # createNav (cursor) + createKeyNav (focus-scoped key binding)
    ├── keyListener.ts      # Global stacked keydown dispatcher
    └── keyCodes.ts         # Maps raw key events → logical KEYS enum
```

---

## Architecture overview

The three `libs/` modules form a layered engine. Components sit on top and only ever call
`createVirtualList` (or `createKeyNav` for the special SquareBanner).

```mermaid
graph TD
    subgraph Components
        App[App.tsx<br/>vertical list]
        Swim[Swimlane.tsx<br/>horizontal list]
        Ban[Banner/index.tsx]
        Child[ChildBanner.tsx]
        Mini[MiniBanner.tsx]
        Square[SquareBanner.tsx<br/>2x2 state machine]
    end

    subgraph "libs/ (the engine)"
        VL[virtualList.ts<br/>createVirtualList]
        Nav[navigation.ts<br/>createNav / createKeyNav]
        KL[keyListener.ts<br/>global keydown stack]
        KC[keyCodes.ts<br/>event -> KEYS]
    end

    App --> VL
    Swim --> VL
    Ban --> VL
    Child --> VL
    Mini --> VL
    Square --> Nav

    VL --> Nav
    Nav --> KL
    App -.uses.-> KC
    Swim -.uses.-> KC
    Ban -.uses.-> KC
    Child -.uses.-> KC
    Mini -.uses.-> KC
    Square -.uses.-> KC

    style VL fill:#2563eb,color:#fff
    style Nav fill:#7c3aed,color:#fff
    style KL fill:#059669,color:#fff
    style KC fill:#64748b,color:#fff
```

**Responsibilities, bottom to top:**

| Layer                 | File              | Responsibility                                                                 |
| --------------------- | ----------------- | ------------------------------------------------------------------------------ |
| Key mapping           | `keyCodes.ts`     | Translate a raw `KeyboardEvent` into a logical `KEYS` value.                    |
| Global dispatch       | `keyListener.ts`  | One `keydown` listener; keeps a stack of handlers, dispatches top-first.        |
| Cursor + binding      | `navigation.ts`   | `createNav` holds the moving index; `createKeyNav` subscribes while focused.    |
| Windowing engine      | `virtualList.ts`  | Measure items, compute the visible window, scroll-into-view, keyed focus map.   |
| Presentation          | components        | Render the visible slice; delegate movement & focus to the engine.             |

---

## The windowing engine (`createVirtualList`)

Given the total item count, a per-item size function, and the parent's measured size,
`createVirtualList` returns reactive accessors describing *what to render* and *where*.

```mermaid
flowchart TD
    P[params:<br/>totalItems, sizeOfItem,<br/>parentSize, overscan, padding] --> IM

    IM["itemListMemo<br/>(createMemo)<br/>build start/size/end<br/>for every item"] --> IL[itemList]
    IM --> LSP[listSizePixel]

    POS["position()<br/>(createNav signal)"] --> SP
    IL --> SP["startPosition<br/>(createMemo)<br/>scroll offset that keeps<br/>the focused item in view"]
    PSize[parentSize] --> SP

    SP --> SL
    IL --> SL["list()<br/>getSlicedList + binary search<br/>→ only visible items (+overscan)"]
    PSize --> SL

    POS --> FM["focusedMap<br/>(createProjection)<br/>{ focusedIndex: true }"]
    FM --> ISF["isFocused(index)<br/>per-item focus check"]

    SL --> OUT[["returned API:<br/>list, listSizePixel,<br/>startPosition, isFocused"]]
    LSP --> OUT
    SP --> OUT
    ISF --> OUT

    style IM fill:#2563eb,color:#fff
    style SP fill:#2563eb,color:#fff
    style SL fill:#2563eb,color:#fff
    style FM fill:#7c3aed,color:#fff
    style OUT fill:#0f766e,color:#fff
```

**Returned API**

| Accessor             | Type                        | Meaning                                                     |
| -------------------- | --------------------------- | ----------------------------------------------------------- |
| `list()`             | `Accessor<ListItem[]>`      | Only the items in the current viewport window (+ overscan). |
| `listSizePixel()`    | `Accessor<number>`          | Total scrollable size in px (used to size the track).       |
| `startPosition()`    | `Accessor<number>`          | Pixel offset to translate the track so focus stays visible. |
| `focusedIndex()`     | `Accessor<number>`          | The current cursor index.                                   |
| `isFocused(index)`   | `(index) => boolean`        | Whether a given index is focused (fine-grained).            |

Key implementation details:

- **Binary search slicing** — `getSlicedList` finds the window boundaries with a `lowerBound`
  binary search over the (sorted) item list, so each render is `O(log n)` rather than `O(n)`.
- **Reactive measurement** — the item list is a `createMemo`, so when `parentSize` is measured
  (via `onSettled`) and `sizeOfItem` depends on it, the list recomputes correctly.
- **Keyed focus** — `isFocused` reads from a `createProjection` map keyed by index. Moving the
  cursor only notifies the two indices whose focus state flips, avoiding a re-run on every row.

---

## How a key press flows through the system

Every list that is *focused* subscribes its handler to the global key stack. Because the stack is
dispatched **top-first and stops at the first handler that returns `true`**, only the deepest
focused list consumes the event — this is what gives nested lists their natural focus containment.

```mermaid
sequenceDiagram
    participant User
    participant Win as window keydown
    participant KL as keyListener (stack)
    participant VL as focused list's onKeyDown
    participant Nav as createNav
    participant DOM as Solid reactive DOM

    User->>Win: presses ArrowDown
    Win->>KL: onKeyDown(event)
    Note over KL: iterate handlers top → bottom
    KL->>VL: handler(event)
    VL->>VL: getKey(event) === KEYS.DOWN ?
    VL->>Nav: next()
    Nav->>Nav: position() + 1
    Nav-->>VL: true (handled)
    VL-->>KL: return true
    Note over KL: stop — event consumed
    Nav-->>DOM: position changed →<br/>startPosition & isFocused update
    DOM-->>User: focused item scrolls into view & highlights
```

**Focus subscription lifecycle** (`createKeyNav`): a Solid effect watches the component's
`focused` accessor. While focused, it subscribes the handler to the key stack and returns the
unsubscribe function as cleanup — so losing focus (or unmounting) automatically detaches it.

---

## The nested layout

The root `App` is a vertical virtual list. Every 5th row is a `Banner`; the rest are `Swimlane`s.
Banners nest further, demonstrating that the engine composes to any depth.

```mermaid
graph TD
    App["App — vertical list (1000 rows)"]
    App --> S["Swimlane × N<br/>horizontal list (1000 items)"]
    App --> B["Banner (every 5th row)<br/>5 cells"]

    B --> B0["cell 0,2,4<br/>plain number"]
    B --> B1["cell 1<br/>SquareBanner (2×2 grid)"]
    B --> B3["cell 3<br/>ChildBanner (vertical list)"]

    B3 --> C["ChildBanner cells"]
    C --> C2["cell 2<br/>MiniBanner (horizontal list)"]
    C --> Cx["other cells<br/>plain number"]

    style App fill:#1d4ed8,color:#fff
    style B fill:#2563eb,color:#fff
    style B3 fill:#3b82f6,color:#fff
    style C fill:#60a5fa,color:#000
```

`SquareBanner` is the one component that does **not** use `createVirtualList` — it is a small,
fixed 2×2 grid whose focus moves via an explicit `stateMachine` lookup table (`1↔2`, `1↔3`, etc.),
wired directly to `createKeyNav`.

---

## Reactive data flow (Solid signals)

```mermaid
graph LR
    subgraph "Global store.ts"
        RB[redBg signal]
        SA[showAll signal]
    end

    subgraph "Per-list state"
        POS[position signal<br/>createNav]
        PS[parentSize signal]
    end

    POS --> SPos[startPosition memo]
    POS --> FMap[focusedMap projection]
    PS --> ILM[itemList memo]
    PS --> SPos

    ILM --> ListAcc["list() accessor"]
    SPos --> ListAcc
    FMap --> ISF["isFocused()"]

    ListAcc --> JSX["JSX &lt;For&gt; render"]
    ISF --> JSX
    RB --> JSX
    SA --> JSX

    style RB fill:#64748b,color:#fff
    style SA fill:#64748b,color:#fff
    style POS fill:#7c3aed,color:#fff
    style PS fill:#7c3aed,color:#fff
    style JSX fill:#0f766e,color:#fff
```

- `store.ts` holds two **global** signals (`redBg`, `showAll`) toggled by the `M` and `A` keys and
  read by every rendered label.
- Each list instance owns a **local** `position` (cursor) and `parentSize` (measured on mount).
- Everything downstream (`startPosition`, `list`, `isFocused`) is derived, so the DOM updates
  automatically and minimally when any source changes.

---

## Tech stack

| Concern        | Choice                                     |
| -------------- | ------------------------------------------ |
| UI framework   | SolidJS 2.x (`solid-js` + `@solidjs/web`)  |
| Build tool     | Vite                                       |
| Styling        | Tailwind CSS v4 (`@tailwindcss/vite`)      |
| Legacy support | `@vitejs/plugin-legacy` (minified via terser) |
| Language       | TypeScript                                 |

---

## Available scripts

### `npm run dev` / `npm start`

Runs the app in development mode, served on `0.0.0.0`. Open the URL printed in the terminal
(watch the output for the exact port). The page hot-reloads on edits.

### `npm run build`

Builds the production bundle into `dist/` — a modern bundle plus a legacy bundle (for older
browsers / TV webviews), both minified with terser and content-hashed.

### `npm run serve`

Previews the production build locally.

---

## Deployment

The `dist/` folder is static and can be hosted on any static provider (Netlify, Vercel, GitHub
Pages, S3, etc.).
