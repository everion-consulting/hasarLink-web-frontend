import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

import styles from "../../styles/managementDashboard.module.css";
import api from "../../services/apiServices";
import { useProfile } from "../../context/ProfileContext";

const PERIODS = [
  { key: "DAILY", label: "Gunluk" },
  { key: "WEEKLY", label: "Haftalik" },
  { key: "MONTHLY", label: "Aylik" },
  { key: "ALL_TIME", label: "Tum Zamanlar" },
];

const CHART_COLORS = [
  "#133E87", "#608BC1", "#4CAF50", "#FF7043", "#9C27B0",
  "#26A69A", "#FFC107", "#EF5350", "#5C6BC0", "#00897B",
];

function TrendArrow({ current, previous }) {
  if (!previous || previous === 0) {
    return <span className={styles.trendNeutral}>-</span>;
  }
  const diff = current - previous;
  const pct = Math.round((diff / previous) * 100);
  if (diff > 0) {
    return (
      <span className={`${styles.kpiTrend} ${styles.trendUp}`}>
        {"\u2191"} %{pct}
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className={`${styles.kpiTrend} ${styles.trendDown}`}>
        {"\u2193"} %{Math.abs(pct)}
      </span>
    );
  }
  return <span className={`${styles.kpiTrend} ${styles.trendNeutral}`}>= %0</span>;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTrendLabel(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric", month: "short",
    });
  } catch {
    return dateStr;
  }
}

export default function ManagementDashboard() {
  const { profileData } = useProfile();
  const [period, setPeriod] = useState("WEEKLY");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [activeTab, setActiveTab] = useState("reference");
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);

  const [refSort, setRefSort] = useState({ key: "notification_count", dir: "desc" });
  const [userSort, setUserSort] = useState({ key: "notification_count", dir: "desc" });

  useEffect(() => {
    loadDashboard();
  }, [period]);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError(false);
      const res = await api.getManagementDashboard(period);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  // Yetki kontrolu
  if (profileData && !["ADMIN", "SUPER_ADMIN"].includes(profileData.user_type)) {
    return (
      <div className={styles.accessDenied}>
        <h2>Erisim Engellendi</h2>
        <p>Bu sayfaya erisim yetkiniz bulunmamaktadir.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        Yukleniyor...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.page}>
        <div className={styles.apiError}>Veriler alinamadi. Lutfen tekrar deneyin.</div>
      </div>
    );
  }

  const { kpi, trends, by_reference_code, by_user, user_trends, date_range } = data;

  // ── Siralama ──
  function sortData(arr, sortState) {
    return [...arr].sort((a, b) => {
      const aVal = a[sortState.key] ?? 0;
      const bVal = b[sortState.key] ?? 0;
      if (typeof aVal === "string") return sortState.dir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortState.dir === "asc" ? aVal - bVal : bVal - aVal;
    });
  }

  function toggleSort(current, setCurrent, key) {
    setCurrent(current.key === key
      ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
      : { key, dir: "desc" });
  }

  function sortIcon(sortState, key) {
    if (sortState.key !== key) return " \u2195";
    return sortState.dir === "asc" ? " \u2191" : " \u2193";
  }

  const sortedRefData = sortData(by_reference_code || [], refSort);
  const sortedUserData = sortData(by_user || [], userSort);

  // ── Grafik Verileri ──
  const refChartData = [...(by_reference_code || [])]
    .sort((a, b) => b.notification_count - a.notification_count)
    .slice(0, 10)
    .map((x) => ({
      name: x.sahaci_adi !== x.repair_area_code ? x.sahaci_adi : x.repair_area_code,
      bildirim: x.notification_count,
      uye: x.user_count,
      donem_uye: x.period_user_count || 0,
    }));

  const pieData = (by_reference_code || [])
    .filter((x) => x.notification_count > 0)
    .slice(0, 8)
    .map((x) => ({
      name: x.sahaci_adi !== x.repair_area_code ? x.sahaci_adi : x.repair_area_code,
      value: x.notification_count,
    }));

  // ── Kullanici Trend Grafigi ──
  // Tum kullanicilari ayni chart'ta gostermek icin veriyi donustur
  const userTrendChartData = (() => {
    if (!user_trends || user_trends.length === 0) return [];
    // Tum tarihleri topla
    const dateSet = new Set();
    user_trends.forEach((u) => u.data.forEach((d) => dateSet.add(d.date)));
    const dates = [...dateSet].sort();
    return dates.map((date) => {
      const point = { date, label: formatTrendLabel(date) };
      user_trends.forEach((u) => {
        const found = u.data.find((d) => d.date === date);
        point[u.full_name] = found ? found.count : 0;
      });
      return point;
    });
  })();

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1>Yonetim Rapor Paneli</h1>
          <div className={styles.subtitle}>
            HasarLink performans ve analiz dashboard'u
          </div>
        </div>
        {date_range && (
          <div className={styles.dateRange}>
            {formatDate(date_range.start)} - {formatDate(date_range.end)}
          </div>
        )}
      </div>

      {/* PERIOD SELECTOR */}
      <div className={styles.periodSelector}>
        {PERIODS.map((p) => (
          <button
            key={p.key}
            className={period === p.key ? styles.active : ""}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI CARDS */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Yeni Uyeler</div>
          <div className={styles.kpiValue}>{kpi.new_users_period}</div>
          <TrendArrow current={kpi.new_users_period} previous={kpi.prev_period_users} />
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Toplam Uye</div>
          <div className={styles.kpiValue}>{kpi.total_users?.toLocaleString("tr-TR")}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Donem Bildirimleri</div>
          <div className={styles.kpiValue}>{kpi.notifications_period}</div>
          <TrendArrow current={kpi.notifications_period} previous={kpi.prev_period_notifications} />
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Toplam Bildirimler</div>
          <div className={styles.kpiValue}>{kpi.total_notifications?.toLocaleString("tr-TR")}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Aktif Sahaci</div>
          <div className={styles.kpiValue}>{kpi.active_field_users}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Donusum Orani</div>
          <div className={styles.kpiValue}>%{kpi.conversion_rate}</div>
          <div className={styles.kpiLabel} style={{ marginTop: 2 }}>
            Ort. {kpi.avg_notifications_per_user} bildirim/kullanici
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className={styles.chartsGrid}>
        {/* Uye Kayit Trendi */}
        <div className={styles.chartBox}>
          <h2>Uye Kayit Trendi</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={(trends.registrations || []).map((x) => ({ ...x, label: formatTrendLabel(x.date) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef3fb" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} />
              <Line type="monotone" dataKey="count" name="Kayit" stroke="#133E87" strokeWidth={3} dot={{ r: 4, fill: "#133E87" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bildirim Trendi */}
        <div className={styles.chartBox}>
          <h2>Bildirim Trendi</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={(trends.notifications || []).map((x) => ({ ...x, label: formatTrendLabel(x.date) }))}>
              <defs>
                <linearGradient id="colorNotif" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef3fb" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} />
              <Area type="monotone" dataKey="count" name="Bildirim" stroke="#4CAF50" strokeWidth={3} fill="url(#colorNotif)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sahaci Performans - Bildirim + Uye Yaptirma */}
        <div className={styles.chartBox}>
          <h2>Sahaci Performansi (Bildirim & Uye Yaptirma)</h2>
          {refChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={refChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#eef3fb" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} />
                <Legend />
                <Bar dataKey="bildirim" name="Bildirim Yaptirma" fill="#133E87" radius={[0, 6, 6, 0]} />
                <Bar dataKey="uye" name="Toplam Uye" fill="#608BC1" radius={[0, 6, 6, 0]} />
                <Bar dataKey="donem_uye" name="Donem Uye Yaptirma" fill="#4CAF50" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.emptyState}>Bu donem icin veri bulunamadi</div>
          )}
        </div>

        {/* Pie Chart */}
        <div className={styles.chartBox}>
          <h2>Bildirim Dagilimi (Sahaci Bazli)</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie
                  data={pieData} cx="50%" cy="50%"
                  innerRadius={60} outerRadius={110}
                  paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ strokeWidth: 1 }}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.emptyState}>Bu donem icin veri bulunamadi</div>
          )}
        </div>
      </div>

      {/* KULLANICI TREND GRAFIGI */}
      {user_trends && user_trends.length > 0 && (
        <div className={styles.chartBox} style={{ marginBottom: 36 }}>
          <h2>Kullanici Bazli Bildirim Trendi (Top 10)</h2>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={userTrendChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef3fb" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} />
              <Legend />
              {user_trends.map((u, i) => (
                <Line
                  key={u.user_id}
                  type="monotone"
                  dataKey={u.full_name}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* TABLES SECTION */}
      <div className={styles.tablesSection}>
        <div className={styles.tabBar}>
          <button
            className={`${styles.tabButton} ${activeTab === "reference" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("reference")}
          >
            Sahaci Performansi
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "users" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Kullanici Performansi
          </button>
        </div>

        <div className={styles.tableContainer}>
          {/* ── SAHACI PERFORMANS TABLOSU ── */}
          {activeTab === "reference" && (
            <>
              {sortedRefData.length > 0 ? (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th onClick={() => toggleSort(refSort, setRefSort, "repair_area_code")} style={{ cursor: "pointer" }}>
                        Bolge Kodu{sortIcon(refSort, "repair_area_code")}
                      </th>
                      <th onClick={() => toggleSort(refSort, setRefSort, "sahaci_adi")} style={{ cursor: "pointer" }}>
                        Sahaci Adi{sortIcon(refSort, "sahaci_adi")}
                      </th>
                      <th onClick={() => toggleSort(refSort, setRefSort, "user_count")} style={{ cursor: "pointer" }}>
                        Toplam Uye{sortIcon(refSort, "user_count")}
                      </th>
                      <th onClick={() => toggleSort(refSort, setRefSort, "period_user_count")} style={{ cursor: "pointer" }}>
                        Donem Uye Yaptirma{sortIcon(refSort, "period_user_count")}
                      </th>
                      <th onClick={() => toggleSort(refSort, setRefSort, "notification_count")} style={{ cursor: "pointer" }}>
                        Bildirim Yaptirma{sortIcon(refSort, "notification_count")}
                      </th>
                      <th onClick={() => toggleSort(refSort, setRefSort, "conversion_rate")} style={{ cursor: "pointer" }}>
                        Donusum %{sortIcon(refSort, "conversion_rate")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRefData.map((row, i) => (
                      <tr key={i} onClick={() => { setModalType("reference"); setModalData(row); }}>
                        <td>
                          <span className={`${styles.badge} ${styles.badgeBlue}`}>{row.repair_area_code}</span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{row.sahaci_adi}</td>
                        <td>{row.user_count}</td>
                        <td>
                          <span className={`${styles.badge} ${styles.badgeGreen}`}>{row.period_user_count || 0}</span>
                        </td>
                        <td>
                          <span className={`${styles.badge} ${styles.badgeGreen}`}>{row.notification_count}</span>
                        </td>
                        <td>
                          <span className={`${styles.badge} ${
                            row.conversion_rate >= 100 ? styles.badgeGreen
                              : row.conversion_rate >= 50 ? styles.badgeOrange
                              : styles.badgeGray
                          }`}>
                            %{row.conversion_rate}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={styles.emptyState}>Bu donem icin sahaci verisi bulunamadi</div>
              )}
            </>
          )}

          {/* ── KULLANICI PERFORMANS TABLOSU ── */}
          {activeTab === "users" && (
            <>
              {sortedUserData.length > 0 ? (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th onClick={() => toggleSort(userSort, setUserSort, "full_name")} style={{ cursor: "pointer" }}>
                        Ad Soyad{sortIcon(userSort, "full_name")}
                      </th>
                      <th onClick={() => toggleSort(userSort, setUserSort, "email")} style={{ cursor: "pointer" }}>
                        Email{sortIcon(userSort, "email")}
                      </th>
                      <th onClick={() => toggleSort(userSort, setUserSort, "sahaci_adi")} style={{ cursor: "pointer" }}>
                        Sahaci{sortIcon(userSort, "sahaci_adi")}
                      </th>
                      <th onClick={() => toggleSort(userSort, setUserSort, "registration_date")} style={{ cursor: "pointer" }}>
                        Kayit Tarihi{sortIcon(userSort, "registration_date")}
                      </th>
                      <th onClick={() => toggleSort(userSort, setUserSort, "notification_count")} style={{ cursor: "pointer" }}>
                        Bildirim Sayisi{sortIcon(userSort, "notification_count")}
                      </th>
                      <th onClick={() => toggleSort(userSort, setUserSort, "repair_area_code")} style={{ cursor: "pointer" }}>
                        Bolge Kodu{sortIcon(userSort, "repair_area_code")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUserData.map((row, i) => (
                      <tr key={i} onClick={() => { setModalType("user"); setModalData(row); }}>
                        <td style={{ fontWeight: 600 }}>{row.full_name}</td>
                        <td>{row.email}</td>
                        <td>{row.sahaci_adi || "-"}</td>
                        <td>{formatDate(row.registration_date)}</td>
                        <td>
                          <span className={`${styles.badge} ${styles.badgeGreen}`}>{row.notification_count}</span>
                        </td>
                        <td>
                          <span className={`${styles.badge} ${styles.badgeBlue}`}>{row.repair_area_code}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={styles.emptyState}>Bu donem icin kullanici verisi bulunamadi</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalData && (
        <div className={styles.modalOverlay} onClick={() => setModalData(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setModalData(null)}>
              {"\u2715"}
            </button>

            {modalType === "reference" && (
              <>
                <h2>{modalData.sahaci_adi} ({modalData.repair_area_code})</h2>
                <table className={styles.modalTable}>
                  <tbody>
                    <tr><th>Sahaci Adi</th><td style={{ fontWeight: 600 }}>{modalData.sahaci_adi}</td></tr>
                    <tr><th>Bolge Kodu</th><td><span className={`${styles.badge} ${styles.badgeBlue}`}>{modalData.repair_area_code}</span></td></tr>
                    <tr><th>Toplam Uye Sayisi</th><td>{modalData.user_count}</td></tr>
                    <tr><th>Donemde Uye Yaptirma</th><td><span className={`${styles.badge} ${styles.badgeGreen}`}>{modalData.period_user_count || 0}</span></td></tr>
                    <tr><th>Bildirim Yaptirma</th><td><span className={`${styles.badge} ${styles.badgeGreen}`}>{modalData.notification_count}</span></td></tr>
                    <tr>
                      <th>Donusum Orani</th>
                      <td>
                        <span className={`${styles.badge} ${
                          modalData.conversion_rate >= 100 ? styles.badgeGreen
                            : modalData.conversion_rate >= 50 ? styles.badgeOrange : styles.badgeGray
                        }`}>%{modalData.conversion_rate}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Bu sahaciya ait kullanicilar */}
                {by_user && by_user.filter((u) => u.repair_area_code === modalData.repair_area_code).length > 0 && (
                  <>
                    <h2 style={{ marginTop: 24, fontSize: 16 }}>Bu Sahacinin Kullanicilari</h2>
                    <table className={styles.modalTable}>
                      <thead>
                        <tr>
                          <th>Ad Soyad</th>
                          <th>Email</th>
                          <th>Bildirim</th>
                        </tr>
                      </thead>
                      <tbody>
                        {by_user
                          .filter((u) => u.repair_area_code === modalData.repair_area_code)
                          .map((u, i) => (
                            <tr key={i}>
                              <td>{u.full_name}</td>
                              <td>{u.email}</td>
                              <td><span className={`${styles.badge} ${styles.badgeGreen}`}>{u.notification_count}</span></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </>
                )}
              </>
            )}

            {modalType === "user" && (() => {
              // Bu kullanicinin trend verisini bul
              const userTrend = (user_trends || []).find((t) => t.user_id === modalData.user_id);
              return (
                <>
                  <h2>{modalData.full_name}</h2>
                  <table className={styles.modalTable}>
                    <tbody>
                      <tr><th>Ad Soyad</th><td style={{ fontWeight: 600 }}>{modalData.full_name}</td></tr>
                      <tr><th>Email</th><td>{modalData.email}</td></tr>
                      <tr><th>Sahaci</th><td>{modalData.sahaci_adi || "-"}</td></tr>
                      <tr><th>Bolge Kodu</th><td><span className={`${styles.badge} ${styles.badgeBlue}`}>{modalData.repair_area_code}</span></td></tr>
                      <tr><th>Kayit Tarihi</th><td>{formatDate(modalData.registration_date)}</td></tr>
                      <tr><th>Bildirim Sayisi</th><td><span className={`${styles.badge} ${styles.badgeGreen}`}>{modalData.notification_count}</span></td></tr>
                    </tbody>
                  </table>

                  {/* Kullanici bireysel trend grafigi */}
                  {userTrend && userTrend.data.length > 1 && (
                    <>
                      <h2 style={{ marginTop: 24, fontSize: 16 }}>Aylik Bildirim Trendi</h2>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={userTrend.data.map((d) => ({ ...d, label: formatTrendLabel(d.date) }))}>
                          <defs>
                            <linearGradient id="colorUserTrend" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#133E87" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#133E87" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#eef3fb" />
                          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                          <Area type="monotone" dataKey="count" name="Bildirim" stroke="#133E87" strokeWidth={2} fill="url(#colorUserTrend)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
