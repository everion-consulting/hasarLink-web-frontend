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
    let text = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
    // İlk karakterlerden harfleri al (2-3 harf)
    let letters = "";
    let i = 0;
    while (i < text.length && i < 3 && /[a-zA-Z]/.test(text[i])) {
      letters += text[i].toUpperCase();
      i++;
    }
    // Kalan karakterlerden rakamları al (4-6 rakam)
    let digits = text.slice(i).replace(/[^0-9]/g, "").slice(0, 6);
    onChange?.({ target: { value: letters + digits } });
  };

  const handleTCKNChange = (e) => {
    let text = e.target.value;
    let filtered = text.replace(/[^0-9]/g, "").slice(0, 11);
    onChange?.({ target: { value: filtered } });
  };

  let inputProps = { value: value ?? "", placeholder, ...rest };

  if (type === "chassisNo") {
    inputProps.onChange = handleChassisChange;
    inputProps.maxLength = 17;
  } else if (type === "licenseSerialNo") {
    inputProps.onChange = handleLicenseSerialChange;
    inputProps.maxLength = 9;
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
