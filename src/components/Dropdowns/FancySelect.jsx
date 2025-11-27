// src/components/FancySelect.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/fancySelect.css";

export default function FancySelect({
  options = [],          // [{ value, label }]
  value = "",
  onChange,
  placeholder = "Seçiniz",
  isDisabled = false,
  maxW,
  type = "select",       // "select" | "dateRange"
  dateRange = {},        // { start, end }
  onDateChange,          // (range) => void
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected =
    options.find((o) => String(o.value) === String(value)) || null;

  const filtered = useMemo(() => {
    const s = q.trim().toLocaleLowerCase("tr");
    if (!s) return options;
    return options.filter((o) =>
      (o.label || "").toLocaleLowerCase("tr").includes(s)
    );
  }, [options, q]);

  const showValue =
    type === "dateRange"
      ? dateRange.start
        ? dateRange.end
          ? `${dateRange.start} - ${dateRange.end}`
          : `${dateRange.start} →`
        : placeholder
      : selected
      ? selected.label
      : placeholder;

  const handleSelect = (val) => {
    onChange && onChange(val);
    setOpen(false);
    setQ("");
  };

  const handleClear = () => {
    if (type === "dateRange") {
      onDateChange && onDateChange({ start: "", end: "" });
    } else {
      onChange && onChange("");
    }
  };

  const hasValue =
    type === "dateRange"
      ? !!(dateRange.start || dateRange.end)
      : value !== "" && value !== null && value !== undefined;

  return (
    <div
      className="fs-wrapper"
      style={maxW ? { maxWidth: maxW } : undefined}
      ref={wrapperRef}
    >
      <div className="fs-main">
        <button
          type="button"
          className={`fs-button ${isDisabled ? "fs-button--disabled" : ""}`}
          onClick={() => !isDisabled && setOpen((p) => !p)}
        >
          <span
            className={`fs-button-label ${
              hasValue ? "fs-button-label--active" : "fs-button-label--placeholder"
            }`}
          >
            {showValue}
          </span>
          <span className="fs-button-chevron">▾</span>
        </button>

        {/* Clear butonu (select modunda) */}
        {type !== "dateRange" && (
          <button
            type="button"
            className="fs-clear-btn"
            onClick={handleClear}
            disabled={!hasValue || isDisabled}
          >
            ✕
          </button>
        )}
      </div>

      {open && !isDisabled && (
        <div className="fs-menu">
          {type === "dateRange" ? (
            <div className="fs-date-range">
              <div className="fs-date-field">
                <label className="fs-date-label">Başlangıç Tarihi</label>
                <input
                  type="date"
                  className="fs-input"
                  value={dateRange.start || ""}
                  onChange={(e) =>
                    onDateChange &&
                    onDateChange({ ...dateRange, start: e.target.value })
                  }
                />
              </div>
              <div className="fs-date-field">
                <label className="fs-date-label">Bitiş Tarihi</label>
                <input
                  type="date"
                  className="fs-input"
                  value={dateRange.end || ""}
                  onChange={(e) =>
                    onDateChange &&
                    onDateChange({ ...dateRange, end: e.target.value })
                  }
                />
              </div>
              <button
                type="button"
                className="fs-btn fs-btn-primary"
                onClick={() => {
                  handleClear();
                  setOpen(false);
                }}
              >
                Temizle
              </button>
            </div>
          ) : (
            <>
              {/* Arama alanı + seçili badge */}
              <div className="fs-search-row">
                <div className="fs-search-wrapper">
                  <span className="fs-search-icon">🔍</span>
                  <input
                    className="fs-input fs-input-search"
                    placeholder="Ara..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                {selected && (
                  <span className="fs-selected-badge">Seçili</span>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="fs-empty">Sonuç yok</div>
              ) : (
                <ul className="fs-list">
                  {filtered.map((opt) => (
                    <li
                      key={opt.value}
                      className="fs-item"
                      onClick={() => handleSelect(opt.value)}
                    >
                      <span className="fs-item-label">{opt.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
