import React, { useContext } from 'react'
import classes from './index.module.css';
import cx from "classnames"
import { LuRectangleHorizontal, LuSlash, LuCircle, LuArrowRight, LuBrush, LuEraser, LuTextCursor, LuUndo, LuRedo, LuDownload } from "react-icons/lu";
import boardContext from '../../store/board-context';
import { TOOL_ITEMS } from '../../constants';

const Toolbar = () => {
    const { activeToolItem, changeToolHandler, boardUndoHandler, boardRedoHandler } = useContext(boardContext);
    const boardDownloadHandler = () => {
        const canvas = document.getElementsByTagName("canvas")[0];
        const data = canvas.toDataURL("image/png");
        const anchor = document.createElement("a");
        anchor.href = data;
        anchor.download = "board.png";
        anchor.click();
    }
    return (
        <div className={classes.container}>
            <div className={cx(classes.toolItem, {
                [classes.active]: activeToolItem === TOOL_ITEMS.BRUSH,
            })}
                onClick={() => changeToolHandler(TOOL_ITEMS.BRUSH)}
            >
                <LuBrush />
            </div>
            <div className={cx(classes.toolItem, {
                [classes.active]: activeToolItem === TOOL_ITEMS.LINE,
            })}
                onClick={() => changeToolHandler(TOOL_ITEMS.LINE)}
            >
                <LuSlash />
            </div>
            <div className={cx(classes.toolItem, {
                [classes.active]: activeToolItem === TOOL_ITEMS.RECTANGLE,
            })}
                onClick={() => changeToolHandler(TOOL_ITEMS.RECTANGLE)}
            >
                <LuRectangleHorizontal />
            </div>
            <div className={cx(classes.toolItem, {
                [classes.active]: activeToolItem === TOOL_ITEMS.CIRCLE,
            })}
                onClick={() => changeToolHandler(TOOL_ITEMS.CIRCLE)}
            >
                <LuCircle />
            </div>
            <div className={cx(classes.toolItem, {
                [classes.active]: activeToolItem === TOOL_ITEMS.ARROW,
            })}
                onClick={() => changeToolHandler(TOOL_ITEMS.ARROW)}
            >
                <LuArrowRight />
            </div>
            <div className={cx(classes.toolItem, {
                [classes.active]: activeToolItem === TOOL_ITEMS.ERASER,
            })}
                onClick={() => changeToolHandler(TOOL_ITEMS.ERASER)}
            >
                <LuEraser />
            </div>
            <div className={cx(classes.toolItem, {
                [classes.active]: activeToolItem === TOOL_ITEMS.TEXT,
            })}
                onClick={() => changeToolHandler(TOOL_ITEMS.TEXT)}
            >
                <LuTextCursor />
            </div>
            <div className={classes.toolItem}
                onClick={boardUndoHandler}
            >
                <LuUndo />
            </div>
            <div className={classes.toolItem}
                onClick={boardRedoHandler}
            >
                <LuRedo />
            </div>
            <div className={classes.toolItem}
                onClick={boardDownloadHandler}
            >
                <LuDownload />
            </div>
        </div>
    )
}

export default Toolbar;
