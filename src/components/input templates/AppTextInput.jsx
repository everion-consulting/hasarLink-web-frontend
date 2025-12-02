import React from "react";
import styles from "../../styles/AppTextInput.module.css";

export default function AppTextInput({
  label,
  error,
  value,
  onChange,
  onBlur,
  placeholder,
  helperText,
  rightAction,
  style,
  inputStyle,
  iconColor,
  placeholderTextColor,
  maxLength,
  type,
  inputMode,
  iconComponent: IconComponent,
  isDark,
  multiline = false,
  rows = 1,
  required = false,
  secureTextEntry,
  ...rest
}) {
  const handleChassisChange = (e) => {
    let text = e.target.value;
    let filtered = text.replace(/[^a-zA-Z0-9]/g, "").slice(0, 17);
    onChange?.({ target: { value: filtered } });
  };

  const handleLicenseSerialChange = (e) => {
    let text = e.target.value;
    let filtered = text.replace(/[^a-zA-Z0-9]/g, "");
    let first2 = filtered.slice(0, 2).replace(/[^A-Za-z]/g, "").toUpperCase();
    let last6 = filtered.slice(2, 8).replace(/[^0-9]/g, "");
    let result = (first2 + last6).slice(0, 8);
    onChange?.({ target: { value: result } });
  };

  const handleTCKNChange = (e) => {
    let text = e.target.value;
    let filtered = text.replace(/[^0-9]/g, "").slice(0, 11);
    onChange?.({ target: { value: filtered } });
  };

  let inputProps = { value, placeholder, ...rest };

  if (type === "chassisNo") {
    inputProps.onChange = handleChassisChange;
    inputProps.maxLength = 17;
  } else if (type === "licenseSerialNo") {
    inputProps.onChange = handleLicenseSerialChange;
    inputProps.maxLength = 8;
  } else if (type === "tckn") {
    inputProps.onChange = handleTCKNChange;
    inputProps.maxLength = 11;
  } else {
    inputProps.onChange = onChange;
    inputProps.maxLength = maxLength;
  }

  let inputType = secureTextEntry ? "password" : "text";
  if (!secureTextEntry) {
    if (type === "email") inputType = "email";
    if (type === "number") inputType = "number";
    if (type === "password") inputType = "password";
    if (type === "tel") inputType = "tel";
  }

  return (
    <div
      className={`${styles.appTextInput} ${isDark ? styles.appTextInputDark : ""
        }`}
      style={style}
    >
      {label && (
        <label className={styles.inputLabel}>
          {label}
          {required && <span className={styles.requiredIndicator}> *</span>}
        </label>
      )}

      <div
        className={`${styles.inputContainer} ${error ? styles.inputContainerError : ""
          }`}
      >
        {IconComponent && (
          <div className={styles.inputIcon}>
            <IconComponent
              className={styles.icon}
              style={{ color: iconColor || "#9E9E9E" }}
            />
          </div>
        )}

        {multiline ? (
          <textarea
            className={`${styles.textInput} ${IconComponent ? styles.textInputWithIcon : ""
              } ${styles.textInputMultiline}`}
            value={value}
            onChange={inputProps.onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            maxLength={inputProps.maxLength}
            rows={rows}
            style={inputStyle}
            {...rest}
          />
        ) : (
          <input
            type={inputType}
            inputMode={inputMode}
            className={`${styles.textInput} ${IconComponent ? styles.textInputWithIcon : ""
              }`}
            value={value}
            onChange={inputProps.onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            maxLength={inputProps.maxLength}
            style={inputStyle}
            {...rest}
          />
        )}

        {rightAction && (
          <button
            className={styles.actionButton}
            onClick={rightAction.onPress}
            type="button"
          >
            {rightAction.label}
          </button>
        )}
      </div>

      {error ? (
        <div className={styles.errorText}>{error}</div>
      ) : helperText ? (
        <div className={styles.helperText}>{helperText}</div>
      ) : null}
    </div>
  );
}
