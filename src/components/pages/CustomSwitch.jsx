import React from "react";
import styles from "../../styles/customSwitch.module.css"; 

export default function CustomSwitch({ value, onChange }) {
    return (
        <label className={styles.switch}>
            <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className={styles.slider}></span>
        </label>
    );
}