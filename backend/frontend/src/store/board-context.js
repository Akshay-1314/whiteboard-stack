import { createContext } from "react";

const boardContext = createContext({
    initialCanvas: {},
    activeToolItem: "",
    elements: [],
    history: [[]],
    index: 0,
    toolActionType: "",
    changeToolHandler: () => { },
    boardMouseDownHandler: () => { },
    boardMouseMoveHandler: () => { },
    boardMouseUpHandler: () => { },
});

export default boardContext;