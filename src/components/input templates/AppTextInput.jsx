import React from "react";
import "../../styles/appTextInput.css";

export default function AppTextInput({
  label,
  error,
  value,
  onChange,
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

  // Şasi No: Sadece harf/rakam, en fazla 17 karakter
  const handleChassisChange = (e) => {
    let text = e.target.value;
    let filtered = text.replace(/[^a-zA-Z0-9]/g, '').slice(0, 17);
    if (onChange) {
      onChange({ target: { value: filtered } });
    }
  };

  // Ruhsat Seri No: İlk 2 büyük harf, sonra 6 rakam (toplam 8 karakter)
  const handleLicenseSerialChange = (e) => {
    let text = e.target.value;
    let filtered = text.replace(/[^a-zA-Z0-9]/g, '');
    let first2 = filtered.slice(0, 2).replace(/[^A-Za-z]/g, '').toUpperCase();
    let last6 = filtered.slice(2, 8).replace(/[^0-9]/g, '');
    let result = (first2 + last6).slice(0, 8);
    if (onChange) {
      onChange({ target: { value: result } });
    }
  };

  // TC Kimlik No: Sadece rakam, en fazla 11 karakter
  const handleTCKNChange = (e) => {
    let text = e.target.value;
    let filtered = text.replace(/[^0-9]/g, '').slice(0, 11);
    if (onChange) {
      onChange({ target: { value: filtered } });
    }
  };

  let inputProps = {
    value,
    placeholder,
    ...rest,
  };

  // Event handler'ı belirle
  if (type === 'chassisNo') {
    inputProps.onChange = handleChassisChange;
    inputProps.maxLength = 17;
  } else if (type === 'licenseSerialNo') {
    inputProps.onChange = handleLicenseSerialChange;
    inputProps.maxLength = 8;
  } else if (type === 'tckn') {
    inputProps.onChange = handleTCKNChange;
    inputProps.maxLength = 11;
  } else {
    inputProps.onChange = onChange;
    inputProps.maxLength = maxLength;
  }

  // Input type'ını belirle
  let inputType = "text";
  if (secureTextEntry) {
    inputType = "password";
  } else {
    if (type === 'email') inputType = "email";
    if (type === 'number') inputType = "number";
    if (type === 'tckn') inputType = "text";
    if (type === 'password') inputType = "password";
    if (type === 'tel') inputType = "tel";
  }
  
  return (
    <div className={`app-text-input ${isDark ? 'dark' : ''}`} style={style}>
      {label ? (
        <label className="input-label">
          {label}
          {required && <span className="required-indicator"> *</span>}
        </label>
      ) : null}

      <div className={`input-container ${error ? 'error' : ''}`}>
        {IconComponent && (
          <div className="input-icon">
            <IconComponent className="icon" style={{ color: iconColor || "#9E9E9E" }} />
          </div>
        )}

        {multiline ? (
          <textarea
            className={`text-input ${IconComponent ? 'with-icon' : ''} ${multiline ? 'multiline' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={inputProps.onChange}
            maxLength={inputProps.maxLength}
            rows={rows}
            style={inputStyle}
            {...rest}
          />
        ) : (
          <input
            type={inputType}
            inputMode={inputMode}
            className={`text-input ${IconComponent ? 'with-icon' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={inputProps.onChange}
            maxLength={inputProps.maxLength}
            style={inputStyle}
            {...rest}
          />
        )}

        {rightAction ? (
          <button
            className="action-button"
            onClick={rightAction.onPress}
            type="button"
          >
            {rightAction.label}
          </button>
        ) : null}
      </div>

      {error ? <div className="error-text">{error}</div> : null}
      {!error && helperText ? (
        <div className="helper-text">{helperText}</div>
      ) : null}
    </div>
  );
}