import { createContext } from "react";

const toolboxContext = createContext({
    toolboxState: {},
    changeStrokeHandler: () => {},
    changeFillHandler: () => {},
    changeSizeHandler: () => {},
});

export default toolboxContext;