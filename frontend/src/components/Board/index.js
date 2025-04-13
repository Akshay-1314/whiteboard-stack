import React, { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import rough from "roughjs";
import boardContext from '../../store/board-context';
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from '../../constants';
import toolboxContext from '../../store/toolbox-context';
import classes from "./index.module.css"
// import updateCanvas from '../../utils/updateCanvas';

const Board = ({initialElements, canvasId, socket}) => {
    const canvasRef = useRef();
    const textAreaRef = useRef();
    const socketRef = useRef(null);
    // const socket = io('http://localhost:8000');
    const { elements, loadCanvas, boardMouseDownHandler, boardMouseMoveHandler, boardMouseUpHandler, toolActionType, textAreaBlurHandler, boardUndoHandler, boardRedoHandler } = useContext(boardContext);
    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, []);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.save();

        const roughCanvas = rough.canvas(canvas);
        elements.forEach((element) => {
            switch (element.type) {
                case TOOL_ITEMS.ARROW:
                case TOOL_ITEMS.CIRCLE:
                case TOOL_ITEMS.RECTANGLE:
                case TOOL_ITEMS.LINE:
                    roughCanvas.draw(element.roughEle);
                    break;
                case TOOL_ITEMS.BRUSH:
                    context.fillStyle = element.stroke;
                    context.fill(element.path);
                    context.restore();
                    break;
                case TOOL_ITEMS.TEXT:
                    context.textBaseline = "top";
                    context.font = `${element.size}px Caveat`;
                    context.fillStyle = element.stroke;
                    context.fillText(element.text, element.x1, element.y1);
                    context.restore();
                    break;
                default:
                    throw new Error("Type not recognized");
            }
        });

        return () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, [elements])

    useEffect(() => {
        const textarea = textAreaRef.current;
        if (toolActionType === TOOL_ACTION_TYPES.WRITING) {
            setTimeout(() => {
                textarea.focus();
            }, 0);
        }
    }, [toolActionType])

    useEffect(() => {
        function handleKeyDown(event) {
          if ((event.ctrlKey || event.metaKey) && event.key === "z") {
            event.preventDefault();
            boardUndoHandler();
          } else if ((event.ctrlKey || event.metaKey) && event.key === "y") {
            event.preventDefault();
            boardRedoHandler();
          }
        }
    
        document.addEventListener("keydown", handleKeyDown);
    
        return () => {
          document.removeEventListener("keydown", handleKeyDown);
        };
      }, [boardUndoHandler, boardRedoHandler]);

    useEffect(() => {
        loadCanvas(initialElements);
    }, [loadCanvas, initialElements]);

    const { toolboxState } = useContext(toolboxContext);

    const handleMouseDown = (event) => {
        boardMouseDownHandler(event, toolboxState);
    }
    const handleMouseMove = (event) => {
        boardMouseMoveHandler(event);
    }

    const handleMouseUp = () => {
        boardMouseUpHandler();
        if (!socketRef.current)
            socketRef.current = socket;
        socketRef.current.emit("drawingUpdate", {canvasId, elements});
        // updateCanvas(canvasId, elements);
    }
    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = socket;
        }
        socketRef.current.on("receiveDrawingUpdate", (updatedElements) => {
            console.log("Received drawing update:", updatedElements);
            loadCanvas(updatedElements); // Update the UI with new elements
        });
    
        return () => {
            socketRef.current.off("receiveDrawingUpdate");
        };
    }, [loadCanvas, socket]);
    

    return (
        <>
            {toolActionType === TOOL_ACTION_TYPES.WRITING && <textarea
                type="text"
                className={classes.textElementBox}
                style={{
                    top: elements[elements.length - 1].y1,
                    left: elements[elements.length - 1].x1,
                    fontSize: `${elements[elements.length - 1]?.size}px`,
                    color: elements[elements.length - 1].stroke,
                }}
                ref={textAreaRef}
                onBlur={(event) => textAreaBlurHandler(event.target.value, toolboxState)}
                />
            }
            <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} />
        </>
    )
}

export default Board;
