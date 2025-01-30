import React, { useContext } from 'react'
import classes from "./index.module.css"
import { COLORS, FILL_TOOL_TYPES, SIZE_TOOL_TYPES, STROKE_TOOL_TYPES, TOOL_ITEMS } from '../../constants'
import cx from "classnames"
import toolboxContext from '../../store/toolbox-context'
import boardContext from '../../store/board-context'
import { v4 as uuidv4 } from 'uuid';

const Toolbox = () => {
    const { activeToolItem } = useContext(boardContext);
    const { toolboxState, changeStrokeHandler, changeFillHandler, changeSizeHandler } = useContext(toolboxContext);
    const strokeColor = toolboxState[activeToolItem]?.stroke;
    const fillColor = toolboxState[activeToolItem]?.fill;
    const size = toolboxState[activeToolItem]?.size;
    return (
        <div className={classes.container}>
            {STROKE_TOOL_TYPES.includes(activeToolItem) && <div className={classes.selectOptionContainer}>
                <div className={classes.toolBoxLabel}>
                    Stroke Color
                </div>
                <div className={classes.colorsContainer}>
                    <div>
                        <input
                            className={classes.colorPicker}
                            type="color"
                            value={strokeColor}
                            onChange={(e) => changeStrokeHandler(activeToolItem, e.target.value)}
                        ></input>
                    </div>
                    {Object.keys(COLORS).map((k) => {
                        return <div className={cx(classes.colorBox, {
                            [classes.activeColorBox]: COLORS[k] === strokeColor
                        })}
                            style={{ backgroundColor: COLORS[k] }}
                            key={uuidv4()}
                            onClick={() => changeStrokeHandler(activeToolItem, COLORS[k])}>

                        </div>
                    })}
                </div>
            </div>}
            {FILL_TOOL_TYPES.includes(activeToolItem) && <div className={classes.selectOptionContainer}>
                <div className={classes.toolBoxLabel}>
                    Fill Color
                </div>
                <div className={classes.colorsContainer}>
                    {fillColor === null ? (
                        <div
                            className={cx(classes.colorPicker, classes.noFillColorBox)}
                            onClick={() => changeFillHandler(activeToolItem, COLORS.BLACK)}
                        ></div>
                    ) : (
                        <div>
                            <input
                                className={classes.colorPicker}
                                type="color"
                                value={fillColor}
                                onChange={(e) => changeFillHandler(activeToolItem, e.target.value)}
                            ></input>
                        </div>
                    )}
                    <div
                        className={cx(classes.colorBox, classes.noFillColorBox, {
                            [classes.activeColorBox]: fillColor === null,
                        })}
                        onClick={() => changeFillHandler(activeToolItem, null)}
                    ></div>
                    {Object.keys(COLORS).map((k) => {
                        return <div className={cx(classes.colorBox, {
                            [classes.activeColorBox]: COLORS[k] === fillColor
                        })}
                            style={{ backgroundColor: COLORS[k] }}
                            key={uuidv4()}
                            onClick={() => changeFillHandler(activeToolItem, COLORS[k])}>

                        </div>
                    })}
                </div>
            </div>}
            {SIZE_TOOL_TYPES.includes(activeToolItem) && <div className={classes.selectOptionContainer}>
                <div className={classes.toolBoxLabel}>
                    {activeToolItem === TOOL_ITEMS.TEXT ? "Font Size" : "Brush Size"}
                </div>
                <input
                    type="range"
                    min={activeToolItem === TOOL_ITEMS.TEXT ? 12 : 1}
                    max={activeToolItem === TOOL_ITEMS.TEXT ? 64 : 10}
                    step={1}
                    value={size}
                    onChange={(event) => changeSizeHandler(activeToolItem, event.target.value)}></input>
            </div>}
        </div>
    )
}

export default Toolbox;
