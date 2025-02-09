import styles from "./styles.module.css"

interface PrimaryButtonProps {
    text: string
    onClick?: () => any
    isLoading?: boolean
}

export default function PrimaryButton({ text, onClick, isLoading}: PrimaryButtonProps) {
    return (
        <button className={styles.button} onClick={isLoading !== true ? onClick : undefined} disabled={isLoading === true}>
            {isLoading === true ?
                <div className={styles["loading-wrapper"]}>
                    <div className={styles["dot-flashing"]}></div>
                </div>
                : 
                <p>{text}</p>}
        </button>
    );
}