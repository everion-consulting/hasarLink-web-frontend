// src/components/forms/FormRenderer.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  maskPhone,
  maskTCKN,
  normalizeIBAN,
  validateEmail,
  validatePhone,
  validateTCKN,
  validateTCKNSoft,
  validateIBAN,
  validateDateYMD,
  validatePlate,
  validateLicenseSerialNo,
  toDDMMYYYY,
  toYYYYMMDD,
  onlyDigits,
} from "../utils/formatter";
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
} from "@heroicons/react/24/outline";

import styles from "../../styles/FormRenderer.module.css";

export default function FormRenderer({
  fields,
  values,
  setValues,
  onSubmit,
  onFormChange,
}) {
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [touched, setTouched] = useState({});
  const [currentDropdown, setCurrentDropdown] = useState(null);
  const [searchText, setSearchText] = useState("");

  const dateRefs = useRef({});
  const dropdownRef = useRef(null);
  const timeRefs = useRef({});

  const todayYMD = () => {
    const d = new Date(); // local
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`; // YYYY-MM-DD
  };

  const isBirthDateField = (field) => {
    const name = String(field?.name || "").toLowerCase();
    // senin alanların: driver_birth_date, victim_birth_date, repair_birth_date...
    return name.includes("birth_date") || name.includes("birthdate") || name.includes("dogum");
  };

  function findFieldByName(fieldName) {
    for (const field of fields) {
      if (field.name === fieldName) return field;
      if (field.type === "row" && Array.isArray(field.children)) {
        const child = field.children.find((c) => c.name === fieldName);
        if (child) return child;
      }
    }
    return null;
  }

  function applyMask(type, v) {
    if (!v) return v;

    if (type === "phone") return maskPhone(v);
    if (type === "tckn") return maskTCKN(v);
    if (type === "iban") return normalizeIBAN(v);

    if (type === "chassisNo") {
      return String(v).toUpperCase().replace(/\s+/g, "");
    }

    if (type === "licenseSerialNo") {
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
    if (type === "currency") return "text";
    return "text";
  }

  function getInputMode(type) {
    if (type === "tckn" || type === "number" || type === "currency") return "numeric";
    if (type === "email") return "email";
    if (type === "phone") return "tel";
    return "text";
  }

  function validateField(f, v, formValues) {
    const isEmpty = !String(v ?? "").trim();

    if (f.required && isEmpty) {
      return "Bu alan zorunludur";
    }

    if (isEmpty && !f.required) {
      return null;
    }

    if (f.type === "email" && v && !validateEmail(v)) return "Geçerli e-mail girin";
    if (f.type === "phone" && v && !validatePhone(v))
      return "Telefon 0 (5xx) xxx xx xx olmalı";
    if (f.type === "tckn" && v) {
      const digits = onlyDigits(v);
      if (digits.length > 0 && digits.length < 11) return "TCKN 11 hane olmalı";
      if (digits.length === 11 && !validateTCKN(digits)) return "Geçerli bir TCKN giriniz";
    }

    if (f.type === "iban" && v && !validateIBAN(v))
      return "IBAN 'TR' + 24 hane olmalı";
    if (f.type === "date" && v && isBirthDateField(f)) {
      const ymd = toYYYYMMDD(v); // v senin sistemde "DD.MM.YYYY"
      if (ymd && ymd > todayYMD()) return "Doğum tarihi ileri tarih olamaz";
    }
    if (f.type === "datetime" && v) {
      const [datePart, timePart] = String(v).split(" ");
      const isTimeValid = timePart && /^\d{2}:\d{2}$/.test(timePart);
      // if (!validateDateYMD(datePart) || !isTimeValid) {
      //   return "Tarih ve saat DD.MM.YYYY SS:DD olmalı";
      // }
    }

    if (f.type === "chassisNo" && v) {
      const vin = String(v).toUpperCase().replace(/\s+/g, "");
      const invalidLength = vin.length !== 17;
      const invalidChars = /[^A-HJ-NPR-Z0-9]/.test(vin);
      const hasLetter = /[A-Z]/.test(vin);
      const hasNumber = /\d/.test(vin);

      if (invalidLength || invalidChars || !hasLetter || !hasNumber) {
        return "Rakam ve Harf karışık 17 hane olmalı";
      }
    }

    if (f.type === "licenseSerialNo" && v && !validateLicenseSerialNo(v)) return "Lütfen ruhsat seri no 2 büyük harf + 6 rakam giriniz (ör: AB123456)";

    if (f.type === "vehicle_plate" && v) {
      if (!validatePlate(v)) {
        return "Plaka en az 1 rakam içermeli ve en fazla 9 karakter olmalı";
      }
    }

    if (f.validate) {
      return f.validate(v, values);
    }

    return null;
  }

  function validateAllFields(valuesToCheck = values) {
    const nextErrors = {};
    let isValid = true;

    for (const f of fields) {
      if (f.type === "title") continue;

      if (f.type === "row" && Array.isArray(f.children)) {
        for (const child of f.children) {
          const val = valuesToCheck[child.name] ?? "";
          const error = validateField(child, val, valuesToCheck);
          if (error) {
            isValid = false;
            nextErrors[child.name] = error;
          }
        }
        continue;
      }

      const val = valuesToCheck[f.name] ?? "";
      const error = validateField(f, val, valuesToCheck);
      if (error) {
        isValid = false;
        nextErrors[f.name] = error;
      }
    }

    return { errors: nextErrors, isValid };
  }

  function handleChange(name, type, value, formatter) {
    let actualValue = value;
    if (value && typeof value === "object" && value.target) {
      actualValue = value.target.value;
    }

    if (type === "currency") {
      // Sadece rakam ve virgül bırak
      actualValue = String(actualValue).replace(/[^0-9,]/g, "");
      // İlk karakter 0 ise ve sonrasında virgül yoksa kaldır
      if (actualValue.startsWith('0') && actualValue.length > 1 && actualValue[1] !== ',') {
        actualValue = actualValue.substring(1);
      }
    }

    if (type === "tckn" || type === "number") {
      actualValue = String(actualValue).replace(/[^0-9]/g, "");
      if (type === "tckn") {
        actualValue = actualValue.slice(0, 11);
      }
    }

    if (name === 'vehicle_year') {
      actualValue = String(actualValue).replace(/[^0-9]/g, '');
      actualValue = actualValue.slice(0, 4);
    }

    if (type === 'licenseSerialNo') {
      actualValue = String(actualValue).toUpperCase().replace(/\s+/g, '');

      const letters = actualValue.slice(0, 2).replace(/[^A-Z]/g, '');
      const numbers = actualValue.slice(2, 8).replace(/[^0-9]/g, '');
      actualValue = letters + numbers;
    }


    if (type === 'chassisNo') {
      actualValue = String(actualValue).toUpperCase().replace(/\s+/g, '');

      actualValue = actualValue.replace(/[^A-HJ-NPR-Z0-9]/g, '');
      actualValue = actualValue.slice(0, 17);
    }


    if (type === 'vehicle_plate') {
      actualValue = String(actualValue).toUpperCase().replace(/\s+/g, '');

      actualValue = actualValue.replace(/[^A-Z0-9]/g, '');
      actualValue = actualValue.slice(0, 9);
    }

    let finalValue = applyMask(type, actualValue);

    const field = findFieldByName(name);
    if (field && field.transform && typeof field.transform === "function") {
      finalValue = field.transform(finalValue);
    }

    if (formatter && typeof formatter === "function") {
      finalValue = formatter(finalValue);
    }

    setValues((prevValues) => ({
      ...prevValues,
      [name]: finalValue,
    }));
  }

  function handleBlur(name, type) {
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));

    const field = findFieldByName(name);

    if (field) {
      const currentValue = values[name] ?? "";
      const error = validateField(field, currentValue);
      setErrors(prev => ({
        ...prev,
        [name]: error || undefined
      }));
    }
    // 🔹 ÖZEL: Bölge Kodu blur formatı
    if (name === "repair_area_code") {
      const raw = String(values[name] ?? "").replace(/\D/g, "");

      let formatted = raw;
      if (raw.length === 1) formatted = `00${raw}`;
      else if (raw.length === 2) formatted = `0${raw}`;

      if (formatted !== values[name]) {
        setValues(prev => ({
          ...prev,
          [name]: formatted
        }));
      }
    }


    const { isValid } = validateAllFields(values);
    onFormChange?.({ allValid: isValid });
  }

  function handleDropdownSelect(name, value) {
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    setTouchedFields((prev) => ({ ...prev, [name]: true }));

    setCurrentDropdown(null);
    setSearchText("");

    setTimeout(() => {
      const { isValid } = validateAllFields({ ...values, [name]: value });
      onFormChange?.({ allValid: isValid });
    }, 0);
  }


  useEffect(() => {
    const { isValid } = validateAllFields(values);
    onFormChange?.({ allValid: isValid });
  }, [values, fields]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCurrentDropdown(null);
        setSearchText("");
      }
    }

    if (currentDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
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

  function handleFormSubmit(e) {
    e.preventDefault();

    const allTouched = {};
    fields.forEach((f) => {
      if (f.type === "row" && Array.isArray(f.children)) {
        f.children.forEach((c) => {
          allTouched[c.name] = true;
        });
      } else if (f.type !== "title") {
        allTouched[f.name] = true;
      }
    });
    setTouchedFields(allTouched);

    const { errors: allErrors, isValid } = validateAllFields(values);
    setErrors(allErrors);
    onFormChange?.({ allValid: isValid });

    if (isValid && onSubmit) {
      onSubmit(values);
    }
  }

  const renderDropdown = (field) => {
    const currentValue = values[field.name] ?? "";
    const isOpen = currentDropdown === field.name;
    const showError = touchedFields[field.name] && errors[field.name];

    return (
      <div
        key={field.name}
        className={styles.formField}
        ref={isOpen ? dropdownRef : null}
      >
        {field.label && (
          <label className={styles.formLabel}>
            {field.label}
            {field.required && <span className={styles.requiredIndicator}> *</span>}
          </label>
        )}

        <div
          className={`${styles.dropdownTrigger} ${isOpen ? styles.active : ""
            }`}
          onClick={(e) => {
            e.stopPropagation();
            setCurrentDropdown(isOpen ? null : field.name);
            setSearchText("");
          }}
        >
          <span
            className={`${styles.dropdownValue} ${!currentValue ? styles.placeholder : ""
              }`}
          >
            {currentValue
              ? field.options?.find((opt) => opt.value === currentValue)?.label ||
              currentValue
              : field.placeholder || "Seçiniz"}
          </span>
          <ChevronDownIcon className={styles.dropdownIcon} />
        </div>

        {isOpen && (
          <div className={`${styles.dropdownMenu} ${styles.open}`}>
            {field.options && field.options.length > 0 && (
              <>
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className={styles.dropdownSearch}
                />
                <div className={styles.dropdownOptions}>
                  {field.options
                    .filter((opt) =>
                      opt.label
                        .toLowerCase()
                        .includes(searchText.toLowerCase())
                    )
                    .map((item) => (
                      <div
                        key={item.value}
                        className={styles.dropdownOption}
                        onClick={(e) => {
                          e.stopPropagation();
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
              className={styles.dropdownClose}
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
        {touchedFields[field.name] && errors[field.name] && <span className={styles.errorText}>{errors[field.name]}</span>}
      </div>
    );
  };

  return (
    <form className={styles.formRenderer} onSubmit={handleFormSubmit}>
      <div className={styles.formContainer}>
        {fields.map((f) => {
          if (f.type === "title") {
            return (
              <h3 key={f.label} className={styles.formTitle}>
                {f.label}
              </h3>
            );
          }

          if (f.type === "row") {
            return (
              <div key={f.name} className={styles.formRow}>
                {f.children.map((childField) => {
                  const IconComponent =
                    childField.icon ??
                    getFieldIcon(childField.name, childField.type);
                  const currentValue = values[childField.name] ?? "";
                  const showError =
                    touchedFields[childField.name] && errors[childField.name];

                  if (childField.type === "date") {
                    return (
                      <div key={childField.name} className={styles.formField}>
                        <label className={styles.formLabel}>
                          {childField.label}
                          {childField.required && (
                            <span className={styles.requiredIndicator}> *</span>
                          )}
                        </label>

                        <div className={styles.dateInputWrapper}>
                          <input
                            type="date"
                            ref={(el) =>
                              (dateRefs.current[childField.name] = el)
                            }
                            max={isBirthDateField(childField) ? todayYMD() : undefined}
                            name={childField.name}
                            value={
                              currentValue ? toYYYYMMDD(currentValue) : ""
                            }
                            onChange={(e) => {
                              const selectedDate = e.target.value;
                              if (selectedDate) {
                                const formattedDate =
                                  toDDMMYYYY(selectedDate);
                                handleChange(
                                  childField.name,
                                  childField.type,
                                  formattedDate
                                );
                              } else {
                                handleChange(
                                  childField.name,
                                  childField.type,
                                  ""
                                );
                              }
                            }}
                            onBlur={() => handleBlur(childField.name, childField.type)}
                            className={styles.nativeDateInput}
                          />

                          <div
                            className={styles.dateTrigger}
                            onClick={() => {
                              const input =
                                dateRefs.current[childField.name];
                              if (input) {
                                if (input.showPicker) {
                                  input.showPicker();
                                } else {
                                  input.focus();
                                }
                              }
                            }}
                          >
                            {IconComponent && (
                              <IconComponent className={styles.fieldIcon} />
                            )}
                            <span
                              className={`${styles.dateValue} ${!currentValue ? styles.placeholder : ""
                                }`}
                            >
                              {currentValue || "gg.aa.yyyy"}
                            </span>
                          </div>
                        </div>

                        {showError && (
                          <span className={styles.errorText}>
                            {errors[childField.name]}
                          </span>
                        )}
                      </div>
                    );
                  }

                  if (childField.type === "datetime") {
                    const [datePart = "", timePart = ""] =
                      currentValue.split(" ");

                    return (
                      <div key={childField.name} className={styles.formField}>
                        <label className={styles.formLabel}>
                          {childField.label}
                          {childField.required && (
                            <span className={styles.requiredIndicator}>
                              {" "}
                              *
                            </span>
                          )}
                        </label>

                        <div className={styles.dateInputWrapper}>
                          <input
                            type="date"
                            ref={(el) =>
                              (dateRefs.current[childField.name] = el)
                            }
                            name={`${childField.name}_date`}
                            value={datePart ? toYYYYMMDD(datePart) : ""}
                            onChange={(e) => {
                              const selectedDate = e.target.value;
                              let final = "";
                              if (selectedDate) {
                                const formattedDate =
                                  toDDMMYYYY(selectedDate);
                                final = timePart
                                  ? `${formattedDate} ${timePart}`
                                  : formattedDate;
                              }
                              handleChange(
                                childField.name,
                                childField.type,
                                final
                              );

                              const timeInput =
                                timeRefs.current[childField.name];
                              if (timeInput) {
                                if (timeInput.showPicker)
                                  timeInput.showPicker();
                                else timeInput.focus();
                              }
                            }}
                            onBlur={(e) => {
                              const currentValue = values[childField.name] || "";
                              const [date, time] = currentValue.split(" ");

                              if (date && !time) {
                                setTimeout(() => {
                                  const latestValue = values[childField.name] || "";
                                  const [latestDate, latestTime] = latestValue.split(" ");

                                  if (latestDate && !latestTime) {
                                    handleChange(childField.name, childField.type, "");
                                    setTouchedFields(prev => ({ ...prev, [childField.name]: true }));
                                    setErrors((prev) => ({
                                      ...prev,
                                      [childField.name]: "Lütfen tarih ve saati seçiniz",
                                    }));

                                    const dateInput = dateRefs.current[childField.name];
                                    if (dateInput) dateInput.value = "";
                                  }
                                }, 500);
                              }

                              handleBlur(childField.name, childField.type);
                            }}
                            className={styles.nativeDateInput}
                          />

                          <input
                            type="time"
                            ref={(el) =>
                              (timeRefs.current[childField.name] = el)
                            }
                            name={`${childField.name}_time`}
                            value={timePart}
                            onChange={(e) => {
                              const selectedTime = e.target.value;
                              let final = "";
                              if (selectedTime) {
                                final = datePart
                                  ? `${datePart} ${selectedTime}`
                                  : ` ${selectedTime}`;
                              } else {
                                final = datePart || "";
                              }
                              handleChange(
                                childField.name,
                                childField.type,
                                final
                              );
                            }}
                            onBlur={() => handleBlur(childField.name, childField.type)}
                            className={styles.nativeDateInput}
                          />
                          <div
                            className={styles.dateTrigger}
                            onClick={() => {
                              const input =
                                dateRefs.current[childField.name];
                              if (input) {
                                if (input.showPicker)
                                  input.showPicker();
                                else input.focus();
                              }
                            }}
                          >
                            {IconComponent && (
                              <IconComponent className={styles.fieldIcon} />
                            )}
                            <span
                              className={`${styles.dateValue} ${!currentValue ? styles.placeholder : ""
                                }`}
                            >
                              {currentValue || "Tarih ve saat seçiniz"}
                            </span>
                          </div>
                        </div>

                        {touchedFields[childField.name] && errors[childField.name] && (
                          <span className={styles.errorText}>
                            {errors[childField.name]}
                          </span>
                        )}
                      </div>
                    );
                  }

                  if (childField.type === "dropdown") {
                    return renderDropdown(childField);
                  }

                  return (
                    <div key={childField.name} className={styles.formField}>
                      <AppTextInput
                        label={childField.label}
                        placeholder={childField.placeholder}
                        iconComponent={IconComponent}
                        value={values[childField.name] ?? ""}
                        onChange={(e) =>
                          handleChange(
                            childField.name,
                            childField.type,
                            e.target.value,
                            childField.formatter
                          )
                        }
                        onBlur={() => handleBlur(childField.name, childField.type)}
                        error={
                          touchedFields[childField.name] ? errors[childField.name] : undefined
                        }
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

          const IconComponent = f.icon ?? getFieldIcon(f.name, f.type);
          const currentValue = values[f.name] ?? "";
          const showError = touchedFields[f.name] && errors[f.name];

          if (f.type === "date") {
            return (
              <div key={f.name} className={styles.formField}>
                <label className={styles.formLabel}>
                  {f.label}
                  {f.required && (
                    <span className={styles.requiredIndicator}> *</span>
                  )}
                </label>

                <div className={styles.dateInputWrapper}>
                  <input
                    type="date"
                    ref={(el) => (dateRefs.current[f.name] = el)}
                    max={isBirthDateField(f) ? todayYMD() : undefined}
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
                    onBlur={() => handleBlur(f.name, f.type)}
                    className={styles.nativeDateInput}
                  />

                  <div
                    className={styles.dateTrigger}
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
                    {IconComponent && (
                      <IconComponent className={styles.fieldIcon} />
                    )}
                    <span
                      className={`${styles.dateValue} ${!currentValue ? styles.placeholder : ""
                        }`}
                    >
                      {currentValue || "gg.aa.yyyy"}
                    </span>
                  </div>
                </div>

                {touchedFields[f.name] && errors[f.name] && (
                  <span className={styles.errorText}>{errors[f.name]}</span>
                )}
              </div>
            );
          }

          if (f.type === "datetime") {
            const [datePart = "", timePart = ""] = currentValue.split(" ");

            return (
              <div key={f.name} className={styles.formField}>
                <label className={styles.formLabel}>
                  {f.label}
                  {f.required && (
                    <span className={styles.requiredIndicator}>*</span>
                  )}
                </label>

                <div className={styles.dateInputWrapper}>
                  <input
                    type="date"
                    ref={(el) => (dateRefs.current[f.name] = el)}
                    value={datePart ? toYYYYMMDD(datePart) : ""}
                    onChange={(e) => {
                      const selectedDate = e.target.value;

                      if (selectedDate) {
                        const formatted = toDDMMYYYY(selectedDate);
                        handleChange(f.name, f.type, formatted);

                        setTimeout(() => {
                          const timeInput = timeRefs.current[f.name];
                          if (timeInput) {
                            if (timeInput.showPicker)
                              timeInput.showPicker();
                            else timeInput.focus();
                          }
                        }, 200);
                      } else {
                        handleChange(f.name, f.type, "");
                      }
                    }}
                    onBlur={(e) => {
                      const currentValue = values[f.name] || "";
                      const [date, time] = currentValue.split(" ");

                      if (date && !time) {
                        setTimeout(() => {
                          const latestValue = values[f.name] || "";
                          const [latestDate, latestTime] = latestValue.split(" ");

                          if (latestDate && !latestTime) {
                            handleChange(f.name, f.type, "");
                            setTouchedFields(prev => ({ ...prev, [f.name]: true }));
                            setErrors((prev) => ({
                              ...prev,
                              [f.name]: "Lütfen tarih ve saati seçiniz",
                            }));

                            const dateInput = dateRefs.current[f.name];
                            if (dateInput) dateInput.value = "";
                          }
                        }, 500);
                      }

                      handleBlur(f.name, f.type);
                    }}
                    className={styles.nativeDateInput}
                  />

                  <input
                    type="time"
                    ref={(el) => (timeRefs.current[f.name] = el)}
                    value={timePart}
                    onChange={(e) => {
                      const selected = e.target.value;

                      if (selected) {
                        if (datePart) {
                          handleChange(
                            f.name,
                            f.type,
                            `${datePart} ${selected}`
                          );
                          setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors[f.name];
                            return newErrors;
                          });
                        } else {
                          setErrors((prev) => ({
                            ...prev,
                            [f.name]: `Lütfen önce ${f.label} için tarih seçiniz`,
                          }));
                          handleChange(f.name, f.type, "");
                          const timeInput = timeRefs.current[f.name];
                          if (timeInput) timeInput.value = "";
                        }
                      } else {
                        if (datePart) {
                          setErrors((prev) => ({
                            ...prev,
                            [f.name]: `Lütfen ${f.label} için saat seçiniz`,
                          }));
                          handleChange(f.name, f.type, "");
                        } else {
                          handleChange(f.name, f.type, "");
                        }
                      }
                    }}
                    onBlur={() => handleBlur(f.name, f.type)}
                    className={styles.nativeTimeInput}
                  />

                  <div
                    className={styles.dateTrigger}
                    onClick={() => {
                      const di = dateRefs.current[f.name];
                      const ti = timeRefs.current[f.name];
                      const current = values[f.name] || "";
                      const [date, time] = current.split(" ");

                      if (date && !time) {
                        setErrors((prev) => ({
                          ...prev,
                          [f.name]: `Lütfen ${f.label} için saat seçiniz`,
                        }));
                        if (ti) {
                          if (ti.showPicker) ti.showPicker();
                          else ti.focus();
                        }
                      } else {
                        if (di) di.showPicker ? di.showPicker() : di.focus();
                      }
                    }}
                  >
                    {IconComponent && (
                      <IconComponent className={styles.fieldIcon} />
                    )}
                    <span
                      className={`${styles.dateValue} ${!currentValue ? styles.placeholder : ""
                        }`}
                    >
                      {currentValue || "Tarih ve saat seçiniz"}
                    </span>
                  </div>
                </div>

                {touchedFields[f.name] && errors[f.name] && (
                  <span className={styles.errorText}>{errors[f.name]}</span>
                )}
              </div>
            );
          }

          return (
            <AppTextInput
              key={f.name}
              label={f.label}
              placeholder={f.placeholder}
              iconComponent={IconComponent}
              value={values[f.name] ?? ""}
              onChange={(e) =>
                handleChange(f.name, f.type, e.target.value, f.formatter)
              }
              onBlur={() => handleBlur(f.name, f.type)}
              disabled={f.editable === false}
              rightAction={f.rightAction ?? null}
              maxLength={f.maxLength}
              multiline={f.type === "multiline"}
              rows={f.type === "multiline" ? 4 : 1}
              type={f.keyboardType ?? getInputType(f.type)}
              inputMode={getInputMode(f.type)}
              secureTextEntry={f.type === "password" || f.secureTextEntry}
              error={touchedFields[f.name] ? errors[f.name] : undefined}
              helperText={f.helperText}
              required={f.required}
            />
          );
        })}
      </div>
    </form>
  );
}