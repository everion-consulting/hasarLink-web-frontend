import React, { useState, useRef } from "react";
import {
  maskPhone,
  maskTCKN,
  normalizeIBAN,
  validateEmail,
  validatePhone,
  validateTCKN,
  validateIBAN,
  validateDateYMD,
  validateChassisNo,
  validateLicenseSerialNo,
  toDDMMYYYY,
  toYYYYMMDD,
} from "../utils/formatter";
import FormFooter from "./FormFooter";
import AppTextInput from "../input templates/AppTextInput";

// Hero Icons import
import {
  ChevronDownIcon,
  CalendarIcon,
  UserIcon,
  IdentificationIcon,
  EnvelopeIcon,
  PhoneIcon,
  CreditCardIcon,
  TagIcon,
  TruckIcon,
  RectangleStackIcon,
  QrCodeIcon,
  Cog6ToothIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';

import "../../styles/formRenderer.css";

export default function FormRenderer({
  fields,
  values,
  setValues,
  onSubmit,
  submitLabel = "Devam Et",
  renderFooter,
}) {
  const [errors, setErrors] = useState({});
  const [currentDropdown, setCurrentDropdown] = useState(null);
  const [searchText, setSearchText] = useState("");
  
  // 🔥 dateRefs tanımını ekleyin
  const dateRefs = useRef({});

  function applyMask(type, v) {
    if (type === "phone") return maskPhone(v);
    if (type === "tckn") return maskTCKN(v);
    if (type === "iban") return normalizeIBAN(v);
    return v;
  }

  function getInputType(type) {
    if (type === "email") return "email";
    if (type === "phone") return "tel";
    if (type === "number" || type === "tckn") return "number";
    if (type === "password") return "password";
    return "text";
  }

  function validateField(f, v) {
    if (f.required && !String(v).trim()) return "Bu alan zorunludur";
    if (f.type === "email" && v && !validateEmail(v)) return "Geçerli e-mail girin";
    if (f.type === "phone" && v && !validatePhone(v)) return "Telefon 0 (5xx) xxx xx xx olmalı";
    if (f.type === "tckn" && v && !validateTCKN(v)) return "TCKN 11 hane olmalı";
    if (f.type === "iban" && v && !validateIBAN(v)) return "IBAN 'TR' + 24 hane olmalı";
    if (f.type === "date" && v && !validateDateYMD(v)) return "Tarih DD.MM.YYYY olmalı";
    if (f.type === "chassisNo" && v && !validateChassisNo(v)) return "Şasi No 17 karakter, harf/rakam olmalı";
    if (f.type === "licenseSerialNo" && v && !validateLicenseSerialNo(v)) return "Ruhsat Seri No: 2 büyük harf + 6 rakam olmalı";
    if (f.validate) return f.validate(v, values);
    return null;
  }

  function handleChange(name, type, v, formatter) {
    let value = applyMask(type, v);
    if (formatter && typeof formatter === "function") {
      value = formatter(value);
    }
    setValues((p) => ({ ...p, [name]: value }));
  }

  function getFieldIcon(name, type) {
    if (type === "dropdown") return ChevronDownIcon;
    if (type === "date") return CalendarIcon;
    if (name === "fullName") return UserIcon;
    if (name === "nationalId") return IdentificationIcon;
    if (name === "email") return EnvelopeIcon;
    if (name === "phone") return PhoneIcon;
    if (name === "iban") return CreditCardIcon;
    if (name === "brand") return TagIcon;
    if (name === "vehicleType") return TruckIcon;
    if (name === "subModel") return RectangleStackIcon;
    if (name === "licenseSerialNo") return IdentificationIcon;
    if (name === "chassisNo") return QrCodeIcon;
    if (name === "engineNo") return Cog6ToothIcon;
    if (name === "modelYear") return CalendarIcon;
    if (name === "usageType") return ListBulletIcon;
    if (name === "victimVehiclePlate") return TruckIcon;
    return undefined;
  }

  function submit() {
    const nextErrors = {};
    for (const f of fields) {
      const e = validateField(f, values[f.name] ?? "");
      if (e) nextErrors[f.name] = e;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(values);
  }

  const allValid = fields.every((f) => !validateField(f, values[f.name] ?? ""));

  return (
    <div className="form-renderer">
      <div className="form-container">
        {fields.map((f) => {
          // 🔹 Title alanı
          if (f.type === "title") {
            return (
              <h3 key={f.label} className="form-title">
                {f.label}
              </h3>
            );
          }

          // 🔹 Row tipi
          if (f.type === "row") {
            return (
              <div key={f.name} className="form-row">
                {f.children.map((childField) => {
                  const IconComponent = childField.icon ?? getFieldIcon(childField.name, childField.type);

                  // 🔥 Date alanı - row içinde
                  if (childField.type === "date") {
                    const currentValue = values[childField.name] || "";

                    return (
                      <div key={childField.name} className="form-field">
                        <label className="form-label">{childField.label}</label>

                        <div className="date-input-wrapper">
                          <input
                            type="date"
                            ref={(el) => (dateRefs.current[childField.name] = el)}
                            name={childField.name}
                            value={currentValue ? toYYYYMMDD(currentValue) : ""}
                            onChange={(e) => {
                              const selectedDate = e.target.value;
                              if (selectedDate) {
                                const formattedDate = toDDMMYYYY(selectedDate);
                                handleChange(childField.name, childField.type, formattedDate);
                              } else {
                                handleChange(childField.name, childField.type, "");
                              }
                            }}
                            className="native-date-input"
                          />

                          <div
                            className="date-trigger"
                            onClick={() => {
                              const input = dateRefs.current[childField.name];
                              if (input) {
                                if (input.showPicker) {
                                  input.showPicker();
                                } else {
                                  input.focus();
                                }
                              }
                            }}
                          >
                            {IconComponent && <IconComponent className="field-icon" />}
                            <span className={`date-value ${!currentValue ? 'placeholder' : ''}`}>
                              {currentValue || "gg.aa.yyyy"}
                            </span>
                          </div>
                        </div>

                        {errors[childField.name] && (
                          <span className="error-text">{errors[childField.name]}</span>
                        )}
                      </div>
                    );
                  }

                  // Dropdown alanı - row içinde
                  if (childField.type === "dropdown") {
                    return (
                      <div key={childField.name} className="form-field">
                        {childField.label && <label className="form-label">{childField.label}</label>}
                        <div
                          className={`dropdown-trigger ${currentDropdown === childField.name ? 'active' : ''}`}
                          onClick={() => {
                            setCurrentDropdown(currentDropdown === childField.name ? null : childField.name);
                            setSearchText("");
                          }}
                        >
                          <span className={`dropdown-value ${!values[childField.name] ? 'placeholder' : ''}`}>
                            {values[childField.name]
                              ? childField.options.find(opt => opt.value === values[childField.name])?.label
                              : childField.placeholder || "Seçiniz"}
                          </span>
                          <ChevronDownIcon className="dropdown-icon" />
                        </div>

                        {currentDropdown === childField.name && (
                          <div className="dropdown-menu open">
                            <input
                              type="text"
                              placeholder="Ara..."
                              value={searchText}
                              onChange={(e) => setSearchText(e.target.value)}
                              className="dropdown-search"
                            />
                            <div className="dropdown-options">
                              {childField.options
                                .filter(opt =>
                                  opt.label.toLowerCase().includes(searchText.toLowerCase())
                                )
                                .map((item) => (
                                  <div
                                    key={item.value}
                                    className="dropdown-option"
                                    onClick={() => {
                                      handleChange(childField.name, childField.type, item.value);
                                      setCurrentDropdown(null);
                                      setSearchText("");
                                    }}
                                  >
                                    {item.label}
                                  </div>
                                ))}
                            </div>
                            <button
                              className="dropdown-close"
                              onClick={() => { setCurrentDropdown(null); setSearchText(""); }}
                            >
                              Kapat
                            </button>
                          </div>
                        )}
                        {errors[childField.name] && <span className="error-text">{errors[childField.name]}</span>}
                      </div>
                    );
                  }

                  // Diğer input türleri - row içinde
                  return (
                    <div key={childField.name} className="form-field">
                      <AppTextInput
                        label={childField.label}
                        placeholder={childField.placeholder}
                        iconComponent={IconComponent}
                        value={values[childField.name]}
                        onChange={(e) =>
                          handleChange(childField.name, childField.type, e.target.value, childField.formatter)
                        }
                        error={errors[childField.name]}
                        helperText={childField.helperText}
                        maxLength={childField.maxLength}
                        type={getInputType(childField.type)}
                      />
                    </div>
                  );
                })}
              </div>
            );
          }

          // 🔹 Dropdown - tek başına
          if (f.type === "dropdown") {
            const IconComponent = f.icon ?? getFieldIcon(f.name, f.type);
            return (
              <div key={f.name} className="form-field">
                {f.label && <label className="form-label">{f.label}</label>}
                <div
                  className={`dropdown-trigger ${currentDropdown === f.name ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentDropdown(currentDropdown === f.name ? null : f.name);
                    setSearchText("");
                  }}
                >
                  <span className={`dropdown-value ${!values[f.name] ? 'placeholder' : ''}`}>
                    {values[f.name]
                      ? f.options.find(opt => opt.value === values[f.name])?.label
                      : f.placeholder || "Seçiniz"}
                  </span>
                  <ChevronDownIcon className="dropdown-icon" />
                </div>

                {currentDropdown === f.name && (
                  <div className="dropdown-menu open">
                    <input
                      type="text"
                      placeholder="Ara..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="dropdown-search"
                    />
                    <div className="dropdown-options">
                      {f.options
                        .filter(opt =>
                          opt.label.toLowerCase().includes(searchText.toLowerCase())
                        )
                        .map((item) => (
                          <div
                            key={item.value}
                            className="dropdown-option"
                            onClick={() => {
                              handleChange(f.name, f.type, item.value);
                              setCurrentDropdown(null);
                              setSearchText("");
                            }}
                          >
                            {item.label}
                          </div>
                        ))}
                    </div>
                    <button
                      className="dropdown-close"
                      onClick={() => { setCurrentDropdown(null); setSearchText(""); }}
                    >
                      Kapat
                    </button>
                  </div>
                )}
                {errors[f.name] && <span className="error-text">{errors[f.name]}</span>}
              </div>
            );
          }

          // 🔥 Date alanı - tek başına
          if (f.type === "date") {
            const IconComponent = f.icon ?? getFieldIcon(f.name, f.type);
            const currentValue = values[f.name] || "";

            return (
              <div key={f.name} className="form-field">
                <label className="form-label">{f.label}</label>

                <div className="date-input-wrapper">
                  <input
                    type="date"
                    ref={(el) => (dateRefs.current[f.name] = el)}
                    name={f.name}
                    value={currentValue ? toYYYYMMDD(currentValue) : ""}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      if (selectedDate) {
                        const formattedDate = toDDMMYYYY(selectedDate);
                        handleChange(f.name, f.type, formattedDate);
                      } else {
                        handleChange(f.name, f.type, "");
                      }
                    }}
                    className="native-date-input"
                  />

                  <div
                    className="date-trigger"
                    onClick={() => {
                      const input = dateRefs.current[f.name];
                      if (input) {
                        if (input.showPicker) {
                          input.showPicker();
                        } else {
                          input.focus();
                        }
                      }
                    }}
                  >
                    {IconComponent && <IconComponent className="field-icon" />}
                    <span className={`date-value ${!currentValue ? 'placeholder' : ''}`}>
                      {currentValue || "gg.aa.yyyy"}
                    </span>
                  </div>
                </div>

                {errors[f.name] && <span className="error-text">{errors[f.name]}</span>}
              </div>
            );
          }

          // 🔹 Default TextInput
          const IconComponent = f.icon ?? getFieldIcon(f.name, f.type);
          return (
            <AppTextInput
              key={f.name}
              label={f.label}
              placeholder={f.placeholder}
              iconComponent={IconComponent}
              value={values[f.name]}
              onChange={(e) => handleChange(f.name, f.type, e.target.value, f.formatter)}
              disabled={f.editable === false}
              rightAction={f.rightAction ?? null}
              maxLength={f.maxLength}
              multiline={f.type === "multiline"}
              rows={f.type === "multiline" ? 4 : 1}
              type={f.keyboardType ?? getInputType(f.type)}
              secureTextEntry={f.type === "password" || f.secureTextEntry}
              error={errors[f.name]}
              helperText={f.helperText}
            />
          );
        })}

        {typeof renderFooter === "function" ? (
          renderFooter({ submit, allValid, values, errors })
        ) : (
          <FormFooter
            onBack={() => console.log("Back pressed (default)")}
            onNext={submit}
            nextLabel={submitLabel}
            disabled={!allValid}
          />
        )}
      </div>

      {/* Backdrop - dışarı tıklayınca kapanma */}
      {currentDropdown && (
        <div
          className="dropdown-backdrop"
          onClick={() => {
            setCurrentDropdown(null);
            setSearchText("");
          }}
        />
      )}
    </div>
  );
}