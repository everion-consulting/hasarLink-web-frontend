import { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    AreaChart,
    Area
} from "recharts";

import styles from "./../../styles/graphics.module.css";
import api from "../../services/apiServices";
import { mapSubmissionStatsToDashboard } from "../../services/mapSubmissionStatsToDashboard";
import { RadialBarChart, RadialBar } from "recharts";


const COLORS = ["#133E87", "#608BC1", "#E63946", "#999"];

const STATUS_LABELS = {
    Approved: "Onaylandı",
    Pending: "Bekliyor",
    Rejected: "Reddedildi",
    Draft: "Taslak",
    InProgress: "İşlemde",
};

const PERIODS = [
    { key: "DAILY", label: "Günlük" },
    { key: "WEEKLY", label: "Haftalık" },
    { key: "MONTHLY", label: "Aylık" },
    { key: "YEARLY", label: "Yıllık" },
];

export default function Graphics() {
    const [cards, setCards] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [rawCounts, setRawCounts] = useState(null);
    const [estimatedAmount, setEstimatedAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("WEEKLY");
    const [error, setError] = useState(false);

    useEffect(() => {
        loadStats();
    }, [period]);

    async function loadStats() {
        setLoading(true);
        setError(false);

        try {
            const res = await api.getSubmissionStats(period);
            const apiData = res.data;

            if (!apiData || !apiData.counts) {
                throw new Error("Invalid API response");
            }

            const mapped = mapSubmissionStatsToDashboard(apiData);

            setCards(mapped.cards);
            setPieData(mapped.pieData);
            setRawCounts(apiData.counts);
            setEstimatedAmount(apiData.total_estimated_amount || 0);
        } catch (err) {
            console.error(err);
            setError(true);
            setCards([]);
            setPieData([]);
            setRawCounts(null);
            setEstimatedAmount(0);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className={styles.page}>Yükleniyor…</div>;

    const approvalRate =
        rawCounts?.total > 0
            ? ((rawCounts.approved / rawCounts.total) * 100).toFixed(1)
            : 0;

    const statusBarData = pieData.map((x) => ({
        name: x.name,
        value: x.value,
    }));

    const MAX_LIMIT = 80000000;

    const usagePercent = Math.min(
        Math.round((estimatedAmount / MAX_LIMIT) * 100),
        100
    );

    const radialData = [
        {
            name: "Hasar Kullanımı",
            value: usagePercent,
            fill: "#133E87",
        },
    ];


    return (
        <div className={styles.page}>
            <h1>HasarLink Gönderim İstatistikleri</h1>

            {/* Period Selector */}
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

            {error && (
                <div className={styles.apiError}>
                    Sunucuya ulaşılamadı. Lütfen daha sonra tekrar deneyin.
                </div>
            )}

            {!error && rawCounts && (
                <>
                    {/* KPI Cards */}
                    <div className={styles.statsGrid}>
                        {cards.map((c) => (
                            <div key={c.label} className={styles.statCard}>
                                <h3>{c.label}</h3>
                                <span>{c.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.chartsGrid}>
                        {/* Pie */}
                        <div className={styles.chartBox}>
                            <h2>Dosya Durum Dağılımı</h2>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={90}
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {pieData.map((e, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Simple Bar */}
                        <div className={styles.chartBox}>
                            <h2>Durumlara Göre Dosyalar</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={statusBarData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#133E87" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Approval Rate */}
                        <div className={styles.chartBox}>
                            <h2>Onay Oranı</h2>
                            <div className={styles.bigNumber}>%{approvalRate}</div>
                            <small>Toplam dosyalara göre</small>
                        </div>

                        {/* Stacked Approval Process */}
                        <div className={styles.chartBox}>
                            <h2>Onay Süreci</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={[
                                        {
                                            name: "Dosyalar",
                                            Approved: rawCounts.approved,
                                            Pending: rawCounts.pending,
                                            Rejected: rawCounts.rejected,
                                        },
                                    ]}
                                >
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value, name) => [
                                            value,
                                            STATUS_LABELS[name] || name,
                                        ]}
                                    />
                                    <Legend formatter={(v) => STATUS_LABELS[v] || v} />

                                    <Bar dataKey="Approved" stackId="a" fill="#133E87" />
                                    <Bar dataKey="Pending" stackId="a" fill="#608BC1" />
                                    <Bar dataKey="Rejected" stackId="a" fill="#E63946" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className={styles.chartBox}>
                            <h2>Talep Edilen Toplam Tutar</h2>

                            <div className={styles.moneyValue}>
                                ₺{estimatedAmount.toLocaleString("tr-TR")}
                            </div>

                            <ResponsiveContainer width="100%" height={260}>
                                <RadialBarChart
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="70%"
                                    outerRadius="100%"
                                    barSize={18}
                                    data={radialData}
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    <RadialBar dataKey="value" cornerRadius={10} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}
