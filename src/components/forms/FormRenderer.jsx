import React, { useState, useRef, useEffect } from "react";
import {
  maskPhone,
  maskTCKN,
  normalizeIBAN,
  validateEmail,
  validatePhone,
  validateTCKN,
  validateIBAN,
  validateDateYMD,
  validatePlate,
  validateChassisNo,
  validateLicenseSerialNo,
  toDDMMYYYY,
  toYYYYMMDD,
} from "../utils/formatter";
import FormFooter from "./FormFooter";
import AppTextInput from "../input templates/AppTextInput";


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
  submitLabel,
  renderFooter,
}) {
  const [errors, setErrors] = useState({});
  const [currentDropdown, setCurrentDropdown] = useState(null);
  const [searchText, setSearchText] = useState("");



  const dateRefs = useRef({});
  const dropdownRef = useRef(null);
  const timeRefs = useRef({});


  function applyMask(type, v) {
    if (!v) return v;

    if (type === "phone") return maskPhone(v);
    if (type === "tckn") return maskTCKN(v);
    if (type === "iban") return normalizeIBAN(v);

    if (type === "chassisNo") {

      return String(v).toUpperCase().replace(/\s+/g, "");
    }
    if (type === "vehicle_plate") {
      return String(v).toUpperCase().replace(/\s+/g, "");
    }


    return v;
  }


  function getInputType(type) {
    if (type === "email") return "email";
    if (type === "phone") return "tel";
    if (type === "number") return "number";
    if (type === "tckn") return "text";
    if (type === "password") return "password";
    return "text";
  }

  function getInputMode(type) {
    if (type === "tckn" || type === "number") return "numeric";
    if (type === "email") return "email";
    if (type === "phone") return "tel";
    return "text";
  }

  function validateField(f, v) {
    const isEmpty = !String(v).trim();

    if (f.required && isEmpty) {
      return "Bu alan zorunludur";
    }

    if (isEmpty && !f.required) {
      return null;
    }

    if (f.type === "email" && v && !validateEmail(v)) return "Geçerli e-mail girin";
    if (f.type === "phone" && v && !validatePhone(v)) return "Telefon 0 (5xx) xxx xx xx olmalı";
    if (f.type === "tckn" && v && !validateTCKN(v)) return "TCKN 11 hane olmalı";
    if (f.type === "iban" && v && !validateIBAN(v)) return "IBAN 'TR' + 24 hane olmalı";
    if (f.type === "date" && v && !validateDateYMD(v)) return "Tarih DD.MM.YYYY olmalı";
    if (f.type === "datetime" && v) {
      const [datePart, timePart] = String(v).split(" ");
      const isTimeValid = timePart && /^\d{2}:\d{2}$/.test(timePart);
      if (!validateDateYMD(datePart) || !isTimeValid) {
        return "Tarih ve saat DD.MM.YYYY SS:DD olmalı";
      }
    }

    if (f.type === "chassisNo" && v && !validateChassisNo(v)) {
      return "Şasi No 17 karakter olmalı ve I, O, Q harflerini içeremez";
    }

    if (f.type === "licenseSerialNo" && v && !validateLicenseSerialNo(v)) return "Ruhsat Seri No: 2 büyük harf + 6 rakam olmalı";
    if (f.type === "vehicle_plate" && v && !validatePlate(v)) {
      return "Plaka en fazla 9 karakter olmalı ve en az 1 rakam içermeli";
    }


    if (f.validate) return f.validate(v, values);
    return null;
  }

  function handleChange(name, type, value, formatter) {
    let actualValue = value;
    if (value && typeof value === 'object' && value.target) {
      actualValue = value.target.value;
    }

    // Sayısal alanlar için filtreleme
    if (type === 'tckn' || type === 'number') {
      actualValue = String(actualValue).replace(/[^0-9]/g, '');
      if (type === 'tckn') {
        actualValue = actualValue.slice(0, 11);
      }
    }

    let finalValue = applyMask(type, actualValue);

    if (formatter && typeof formatter === "function") {
      finalValue = formatter(finalValue);
    }

    setValues(prevValues => ({
      ...prevValues,
      [name]: finalValue
    }));
  }

  function handleDropdownSelect(name, value) {
    console.log(`🎯 Dropdown SELECTED: ${name} = ${value}`);

    setValues(prevValues => {
      const newValues = {
        ...prevValues,
        [name]: value
      };
      console.log('📝 Updated values:', newValues);
      return newValues;
    });

    setCurrentDropdown(null);
    setSearchText("");
  }

  // 🔥 Click outside için useEffect
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        console.log('🖱️ Clicked outside dropdown');
        setCurrentDropdown(null);
        setSearchText("");
      }
    }

    if (currentDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [currentDropdown]);

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
      if (f.type === "title" || f.type === "row") {
        if (f.type === "row" && f.children) {
          for (const child of f.children) {
            const e = validateField(child, values[child.name] ?? "");
            if (e) nextErrors[child.name] = e;
          }
        }
        continue;
      }

      const e = validateField(f, values[f.name] ?? "");
      if (e) nextErrors[f.name] = e;
    }
    setErrors(nextErrors);

    console.log('Submit - Errors:', nextErrors);
    console.log('Submit - Values:', values);

    if (Object.keys(nextErrors).length === 0) {
      onSubmit(values);
    }
  }

  const allValid = fields.every((f) => {
    if (f.type === "title") return true;
    if (f.type === "row") {
      return f.children.every(child => {
        const error = validateField(child, values[child.name] ?? "");
        return !error; // Hata yoksa true döner
      });
    }

    // Diğer field türleri için
    const error = validateField(f, values[f.name] ?? "");
    return !error; // Hata yoksa true döner
  });

  const renderDropdown = (field) => {
    const currentValue = values[field.name];
    const isOpen = currentDropdown === field.name;

    return (
      <div
        key={field.name}
        className="form-field"
        ref={isOpen ? dropdownRef : null}
      >
        {field.label && (
          <label className="form-label">
            {field.label}
            {field.required && <span className="required-indicator"> *</span>}
          </label>
        )}

        <div
          className={`dropdown-trigger ${isOpen ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            console.log(`🖱️ Dropdown trigger clicked: ${field.name}`);
            setCurrentDropdown(isOpen ? null : field.name);
            setSearchText("");
          }}
        >
          <span className={`dropdown-value ${!currentValue ? 'placeholder' : ''}`}>
            {currentValue
              ? field.options?.find(opt => opt.value === currentValue)?.label || currentValue
              : field.placeholder || "Seçiniz"}
          </span>
          <ChevronDownIcon className="dropdown-icon" />
        </div>

        {isOpen && (
          <div className="dropdown-menu open">
            {field.options && field.options.length > 0 && (
              <>
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="dropdown-search"
                />
                <div className="dropdown-options">
                  {field.options
                    .filter(opt =>
                      opt.label.toLowerCase().includes(searchText.toLowerCase())
                    )
                    .map((item) => (
                      <div
                        key={item.value}
                        className="dropdown-option"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(`🖱️ Option clicked: ${field.name} = ${item.value}`);
                          handleDropdownSelect(field.name, item.value);
                        }}
                      >
                        {item.label}
                      </div>
                    ))}
                </div>
              </>
            )}
            <button
              className="dropdown-close"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentDropdown(null);
                setSearchText("");
              }}
            >
              Kapat
            </button>
          </div>
        )}
        {errors[field.name] && <span className="error-text">{errors[field.name]}</span>}
      </div>
    );
  };

  return (
    <div className="form-renderer">
      <div className="form-container">
        {fields.map((f) => {
          if (f.type === "title") {
            return (
              <h3 key={f.label} className="form-title">
                {f.label}
              </h3>
            );
          }

          if (f.type === "row") {
            return (
              <div key={f.name} className="form-row">
                {f.children.map((childField) => {
                  const IconComponent = childField.icon ?? getFieldIcon(childField.name, childField.type);

                  if (childField.type === "date") {
                    const currentValue = values[childField.name] || "";

                    return (
                      <div key={childField.name} className="form-field">
                        <label className="form-label">
                          {childField.label}
                          {childField.required && <span className="required-indicator"> *</span>}
                        </label>

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
                  if (childField.type === "datetime") {
                    const currentValue = values[childField.name] || "";
                    const [datePart = "", timePart = ""] = currentValue.split(" ");

                    return (
                      <div key={childField.name} className="form-field">
                        <label className="form-label">
                          {childField.label}
                          {childField.required && <span className="required-indicator"> *</span>}
                        </label>

                        <div className="date-input-wrapper">
                          {/* Gizli tarih inputu */}
                          <input
                            type="date"
                            ref={(el) => (dateRefs.current[childField.name] = el)}
                            name={`${childField.name}_date`}
                            value={datePart ? toYYYYMMDD(datePart) : ""}
                            onChange={(e) => {
                              const selectedDate = e.target.value; // YYYY-MM-DD
                              let final = "";
                              if (selectedDate) {
                                const formattedDate = toDDMMYYYY(selectedDate); // DD.MM.YYYY
                                final = timePart ? `${formattedDate} ${timePart}` : formattedDate;
                              }
                              handleChange(childField.name, childField.type, final);

                              // Tarihi seçince saat picker'ını otomatik aç
                              const timeInput = timeRefs.current[childField.name];
                              if (timeInput) {
                                if (timeInput.showPicker) timeInput.showPicker();
                                else timeInput.focus();
                              }
                            }}
                            className="native-date-input"
                          />

                          {/* Gizli saat inputu */}
                          <input
                            type="time"
                            ref={(el) => (timeRefs.current[childField.name] = el)}
                            name={`${childField.name}_time`}
                            value={timePart}
                            onChange={(e) => {
                              const selectedTime = e.target.value; // HH:MM
                              let final = "";
                              if (selectedTime) {
                                final = datePart ? `${datePart} ${selectedTime}` : ` ${selectedTime}`;
                              } else {
                                final = datePart || "";
                              }
                              handleChange(childField.name, childField.type, final);
                            }}
                            className="native-date-input"
                          />

                          {/* Kullanıcının gördüğü trigger */}
                          <div
                            className="date-trigger"
                            onClick={() => {
                              const input = dateRefs.current[childField.name];
                              if (input) {
                                if (input.showPicker) input.showPicker();
                                else input.focus();
                              }
                            }}
                          >
                            {ClockIcon && <ClockIcon className="field-icon" />}
                            <span className={`date-value ${!currentValue ? "placeholder" : ""}`}>
                              {currentValue || "Tarih ve saat seçiniz"}
                            </span>
                          </div>
                        </div>

                        {errors[childField.name] && (
                          <span className="error-text">{errors[childField.name]}</span>
                        )}
                      </div>
                    );
                  }


                  if (childField.type === "dropdown") {
                    return renderDropdown(childField);
                  }

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
                        inputMode={getInputMode(childField.type)}
                        required={childField.required}
                      />
                    </div>
                  );
                })}
              </div>
            );
          }

          if (f.type === "dropdown") {
            return renderDropdown(f);
          }

          if (f.type === "date") {
            const IconComponent = f.icon ?? getFieldIcon(f.name, f.type);
            const currentValue = values[f.name] || "";

            return (
              <div key={f.name} className="form-field">
                <label className="form-label">
                  {f.label}
                  {f.required && <span className="required-indicator"> *</span>}
                </label>

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
          if (f.type === "datetime") {
            const IconComponent = f.icon ?? getFieldIcon(f.name, f.type);
            const currentValue = values[f.name] || "";
            const [datePart = "", timePart = ""] = currentValue.split(" ");

            return (
              <div key={f.name} className="form-field">
                <label className="form-label">
                  {f.label}
                  {f.required && <span className="required-indicator">*</span>}
                </label>

                <div className="date-input-wrapper">

                  {/* GİZLİ TARİH INPUTU */}
                  <input
                    type="date"
                    ref={(el) => (dateRefs.current[f.name] = el)}
                    value={datePart ? toYYYYMMDD(datePart) : ""}
                    onChange={(e) => {
                      const selectedDate = e.target.value; // YYYY-MM-DD

                      let final = "";
                      if (selectedDate) {
                        const formatted = toDDMMYYYY(selectedDate);
                        final = timePart ? `${formatted} ${timePart}` : formatted;
                      }

                      handleChange(f.name, f.type, final);

                      // ⭐ DATE PICKER KAPANDIKTAN SONRA TIME PICKER AÇ
                      setTimeout(() => {
                        const timeInput = timeRefs.current[f.name];
                        if (timeInput) {
                          if (timeInput.showPicker) timeInput.showPicker();
                          else timeInput.focus();
                        }
                      }, 200); // ← kritik gecikme
                    }}
                    className="native-date-input"
                  />

                  {/* GİZLİ SAAT INPUTU */}
                  <input
                    type="time"
                    ref={(el) => (timeRefs.current[f.name] = el)}
                    value={timePart}
                    onChange={(e) => {
                      const selected = e.target.value;

                      let final = "";
                      if (selected) {
                        final = datePart ? `${datePart} ${selected}` : selected;
                      } else {
                        final = datePart || "";
                      }

                      handleChange(f.name, f.type, final);
                    }}
                    className="native-time-input"
                  />

                  {/* GÖRÜNEN TRIGGER */}
                  <div
                    className="date-trigger"
                    onClick={() => {
                      const di = dateRefs.current[f.name];
                      if (di) di.showPicker ? di.showPicker() : di.focus();
                    }}
                  >
                    {IconComponent && <IconComponent className="field-icon" />}
                    <span className={`date-value ${!currentValue ? "placeholder" : ""}`}>
                      {currentValue || "Tarih ve saat seçiniz"}
                    </span>
                  </div>
                </div>

                {errors[f.name] && <span className="error-text">{errors[f.name]}</span>}
              </div>
            );
          }



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
              inputMode={getInputMode(f.type)}
              secureTextEntry={f.type === "password" || f.secureTextEntry}
              error={errors[f.name]}
              helperText={f.helperText}
              required={f.required}
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
    </div>
  );
}

