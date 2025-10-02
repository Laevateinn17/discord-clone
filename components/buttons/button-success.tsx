"use client"
import { ReactNode, useEffect, useState } from "react"
import styles from "./styles.module.css"
import Tooltip from "../tooltip/tooltip"
import styled from "styled-components"
import { LoadingIndicator } from "../loading-indicator/loading-indicator"

interface ButtonSuccessProps {
    children: ReactNode
    onClick?: () => any
    isLoading?: boolean
    tooltip?: string
    tooltipPosition?: "top" | "bottom" | "left" | "right"
    tooltipSize?: string
    className?: string
    disabled?: boolean
    size?: "sm" | "md" | "lg"
}

const Button = styled.button`
    display: flex;
    background-color: var(--status-positive);
    border: 1px solid transparent;
    border-radius: 8px;
    color: var(--text-primary);
    align-items: center;
    font-weight: var(--font-weight-medium);

    &.hover {
        background-color: var(--status-positive-hover);
    }

    &.active {
        background-color: var(--button-primary-selected);
        color: var(--text-brand);
    }

    &.disabled {
        // background-color: var(--button-primary-disabled);
        opacity: 0.5;
        cursor: not-allowed;
    }

    &.sm {
        padding: 4px 12px;
        font-size: var(--text-sm);
        line-height: var(--line-height-tight);
        min-height: 32px;
    }

    &.md {
        padding: 4px 12px;
        font-size: var(--text-base);
        line-height: var(--line-height-tight);
        min-height: 32px;
    }

    &.lg {
        padding: 7px 15px;
        font-size: var(--text-base);
        line-height: normal;
        min-height: 38px;
    }
    

`

export default function ButtonSuccess({ className = "", size = 'md', children, onClick, isLoading, disabled, tooltipPosition, tooltip, tooltipSize }: ButtonSuccessProps) {
    const [isHovering, setIsHovering] = useState(false);

    return (
        <Button className={`${className} ${isHovering ? "hover" : ""} ${disabled || isLoading ? "disabled" : ""} ${size}`}
            onClick={isLoading !== true ? onClick : undefined}
            disabled={disabled || isLoading === true}
            onMouseEnter={() => { if (!disabled) setIsHovering(true) }}
            onMouseLeave={() => { if (!disabled) setIsHovering(false) }}>
            {tooltip &&
                <Tooltip position={tooltipPosition!} show={isHovering} text={tooltip} fontSize={tooltipSize} />}
            {isLoading === true ?
                // <div className={styles["loading-wrapper"]}>
                //     <div className={styles["dot-flashing"]}></div>
                // </div>
                <LoadingIndicator />
                :
                children}
        </Button>
    );
}