export function mapSubmissionStatsToDashboard(apiData) {
  if (!apiData || !apiData.counts) return null;

  const c = apiData.counts;

  return {
    cards: [
      { label: "Toplam Dosya", value: c.total },
      { label: "Onaylanan", value: c.approved },
      { label: "Bekleyen", value: c.pending },
      { label: "Reddedilen", value: c.rejected },
      { label: "Taslak", value: c.draft },
      { label: "İşlemde", value: c.in_progress },
    ],
    pieData: [
      { name: "Onaylandı", value: c.approved },
      { name: "Bekliyor", value: c.pending },
      { name: "Reddedildi", value: c.rejected },
    ],
  };
}
