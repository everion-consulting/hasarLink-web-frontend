import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    AreaChart,
    Area
} from "recharts";

import styles from "./../../styles/graphics.module.css";
import api from "../../services/apiServices";
import { mapSubmissionStatsToDashboard } from "../../services/mapSubmissionStatsToDashboard";

const PERIODS = [
    { key: "DAILY", label: "Günlük" },
    { key: "WEEKLY", label: "Haftalık" },
    { key: "MONTHLY", label: "Aylık" },
    { key: "YEARLY", label: "Yıllık" },
];

export default function Graphics() {
    const [cards, setCards] = useState([]);
    const [rawCounts, setRawCounts] = useState(null);
    const [estimatedAmount, setEstimatedAmount] = useState(0);

    const [monthlyCounts, setMonthlyCounts] = useState([]);
    const [monthlyAmounts, setMonthlyAmounts] = useState([]);
    const [monthlyByCompanyRaw, setMonthlyByCompanyRaw] = useState([]);

    const [availableMonths, setAvailableMonths] = useState([]);

    const [companyMonth, setCompanyMonth] = useState(null);
    const [countMonth, setCountMonth] = useState(null);
    const [amountMonth, setAmountMonth] = useState(null);

    const [companyData, setCompanyData] = useState([]);
    const [countData, setCountData] = useState([]);
    const [amountData, setAmountData] = useState([]);

    const [period, setPeriod] = useState("WEEKLY");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        loadStats();
    }, [period]);

    async function loadStats() {
        try {
            setLoading(true);
            setError(false);

            const res = await api.getSubmissionStats(period);
            const apiData = res.data;

            const mapped = mapSubmissionStatsToDashboard(apiData);
            setCards(mapped.cards);
            setRawCounts(apiData.counts);
            setEstimatedAmount(apiData.total_estimated_amount || 0);

            const counts = apiData.monthly_counts.map(x => ({
                month: x.month,
                label: new Date(x.month).toLocaleString("tr-TR", { month: "short", year: "numeric" }),
                value: x.count
            }));

            const amounts = apiData.monthly_estimated_amounts.map(x => ({
                month: x.month,
                label: new Date(x.month).toLocaleString("tr-TR", { month: "short", year: "numeric" }),
                amount: x.amount
            }));

            setMonthlyCounts(counts);
            setMonthlyAmounts(amounts);
            setMonthlyByCompanyRaw(apiData.monthly_by_company);

            const months = [...new Set(apiData.monthly_by_company.map(x => x.month))];
            setAvailableMonths(months);

            const last = months[months.length - 1];
            setCompanyMonth(last);
            setCountMonth(last);
            setAmountMonth(last);

            updateCompany(last, apiData.monthly_by_company);
            updateCount(last, counts);
            updateAmount(last, amounts);

        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }
    const last4Months = [...monthlyAmounts]
        .slice(-4)
        .reverse();


    function updateCompany(month, data) {
        const top = data
            .filter(x => x.month === month)
            .sort((a, b) => b.count - a.count)
            .slice(0, 8)
            .map(x => ({ name: x.company_name, value: x.count }));

        setCompanyData(top);
    }

    function updateCount(month, data) {
        setCountData(data.filter(x => x.month === month));
    }

    function updateAmount(month, data) {
        setAmountData(data.filter(x => x.month === month));
    }

    if (loading) return <div className={styles.page}>Yükleniyor…</div>;

    return (
        <div className={styles.page}>
            <h1>HasarLink Gönderim İstatistikleri</h1>

            <div className={styles.periodSelector}>
                {PERIODS.map(p => (
                    <button
                        key={p.key}
                        className={period === p.key ? styles.active : ""}
                        onClick={() => setPeriod(p.key)}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {error && <div className={styles.apiError}>Veriler alınamadı</div>}

            {!error && rawCounts && (
                <>
                    <div className={styles.statsGrid}>
                        {cards.map(c => (
                            <div key={c.label} className={styles.statCard}>
                                <h3>{c.label}</h3>
                                <span>{c.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.chartsGrid}>
                        {/* SIGORTA */}
                        <div className={styles.chartBox}>
                            <h2>En Yüksek Başvuru Sayısı Olan Sigorta Şirketleri</h2>
                            <select value={companyMonth} onChange={e => {
                                setCompanyMonth(e.target.value);
                                updateCompany(e.target.value, monthlyByCompanyRaw);
                            }}>
                                {availableMonths.map(m => (
                                    <option key={m} value={m}>
                                        {new Date(m).toLocaleString("tr-TR", { month: "long", year: "numeric" })}
                                    </option>
                                ))}
                            </select>

                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={companyData} layout="vertical">
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={260} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#133E87" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Aylık Açılan Dosya – KPI Card */}
                        <div className={styles.chartBox}>
                            <h2>Aylık Açılan Dosya</h2>

                            <select
                                className={styles.monthSelect}
                                value={countMonth}
                                onChange={e => {
                                    setCountMonth(e.target.value);
                                    updateCount(e.target.value, monthlyCounts);
                                }}
                            >
                                {availableMonths.map(m => (
                                    <option key={m} value={m}>
                                        {new Date(m).toLocaleString("tr-TR", { month: "long", year: "numeric" })}
                                    </option>
                                ))}
                            </select>

                            {countData[0] && (() => {
                                const current = countData[0].value;
                                const last4 = monthlyCounts.slice(-4).map(x => x.value);
                                const avg = last4.reduce((a, b) => a + b, 0) / last4.length;
                                const percent = Math.min((current / avg) * 100, 120);

                                return (
                                    <>
                                        <div className={styles.kpiValue}>{current}</div>
                                        <div className={styles.kpiLabel}>Dosya</div>

                                        <div className={styles.kpiBarWrap}>
                                            <div
                                                className={styles.kpiBar}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>

                                        <div className={styles.kpiHint}>
                                            Son 4 ay ortalamasına göre
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        <div className={styles.chartBox}>
                            {last4Months.map((m, i) => {
                                const max = Math.max(...last4Months.map(x => x.amount));
                                const percent = (m.amount / max) * 100;

                                return (
                                    <div key={m.month} className={styles.trendRow}>
                                        <div className={styles.trendLabel}>
                                            {new Date(m.month).toLocaleString("tr-TR", {
                                                month: "long",
                                                year: "numeric"
                                            })}
                                        </div>

                                        <div className={styles.trendBarWrap}>
                                            <div
                                                className={styles.trendBar}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>

                                        <div className={styles.trendValue}>
                                            ₺{m.amount.toLocaleString("tr-TR")}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>


                        <div className={styles.chartBox}>
                            <h2>Seçilen Dönem Toplam Hasar</h2>
                            <div className={styles.moneyValue}>
                                ₺{estimatedAmount.toLocaleString("tr-TR")}
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}
