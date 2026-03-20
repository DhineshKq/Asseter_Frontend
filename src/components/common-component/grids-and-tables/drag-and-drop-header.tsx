import React, { useRef } from 'react';
import { useDrag, useDrop } from "react-dnd";
import type { Identifier, XYCoord } from 'dnd-core'
import { CiMenuBurger } from 'react-icons/ci';
import '../../../styles/common-components/grids-and-tables/grid-eye-filter.scss';

export interface HeaderProps {
    id: any
    text: string
    index: number
    isChecked: boolean
    moveHeader: (dragIndex: number, hoverIndex: number) => void
    handleCheckbox: () => void
}

interface DragItem {
    index: number
    id: string
    type: string
}

const style = {
    // border: '1px dashed gray',
    // padding: '0.5rem 1rem',
    // marginBottom: '.5rem',
    backgroundColor: 'white',
    cursor: 'move',
}

const DragAndDropHeader: React.FC<HeaderProps> = ({ id, text, index, moveHeader, handleCheckbox, isChecked }) => {
    const ref = useRef<HTMLDivElement>(null)
    const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
        accept: 'card',
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            }
        },
        hover(item: DragItem, monitor) {
            if (!ref.current) {
                return
            }

            const dragIndex = item.index
            const hoverIndex = index

            if (dragIndex === hoverIndex) {
                return
            }

            const hoverBoundingRect = ref.current.getBoundingClientRect()
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
            const clientOffset = monitor.getClientOffset()
            const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return
            }
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return
            }

            moveHeader(dragIndex, hoverIndex)
            item.index = hoverIndex
        },
    })

    const [{ isDragging }, drag] = useDrag({
        type: 'card',
        item: () => {
            return { id, index }
        },
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    const opacity = isDragging ? 0 : 1
    drag(drop(ref))

    return (
        <div
            ref={ref}
            style={{ ...style, opacity }}
            className={`column-headings ${isDragging ? 'dragging' : ''}`}
            data-handler-id={handlerId}
            key={index}
            data-testid="app"
        >
            <span>
                <input
                    className="header-list-checkbox"
                    type="checkbox"
                    value={text}
                    checked={isChecked}
                    id={id}
                    onChange={handleCheckbox}
                    data-testid="header-checkbox"
                />
            </span>
            <CiMenuBurger className="menu-icon" />
            <span className="names">{text}</span>
            <div className="drop-area" />
        </div>
    );
};

export default DragAndDropHeader;