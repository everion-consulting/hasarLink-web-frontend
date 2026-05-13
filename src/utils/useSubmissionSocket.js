import { useEffect, useRef, useCallback } from "react";

// API host'undan WS host'unu türet (http→ws, https→wss)
const API_BASE = "https://dosya-bildirim-vrosq.ondigitalocean.app";
const WS_BASE  = API_BASE.replace(/^http/, "ws"); // https → wss, http → ws

/**
 * Bir FileSubmission için WebSocket bağlantısı açar.
 *
 * Backend spec:
 *  - URL:  wss://{host}/ws/submissions/{id}/?token={drfToken}
 *  - İlk mesaj:  { event: "workflow.snapshot", data: {...} }
 *  - Güncelleme: { event: "workflow.update",   data: {...} }
 *  - data alanları: workflow_stage, workflow_stage_display, exper_informations, updated_at
 *  - 4401 → token hatalı, 4403 → yetkisiz (ikisinde de reconnect yok)
 *
 * @param {string|null} submissionId  - UUID
 * @param {(data: object) => void} onUpdate  - workflow güncellemesi gelince çağrılır
 */
export function useSubmissionSocket(submissionId, onUpdate) {
  const wsRef       = useRef(null);
  const retryRef    = useRef(0);
  const timerRef    = useRef(null);
  const onUpdateRef = useRef(onUpdate);

  // Her render'da callback'i taze tut (stale closure yok)
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  const connect = useCallback(() => {
    if (!submissionId) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    const url = `${WS_BASE}/ws/submissions/${submissionId}/?token=${token}`;
    console.log("[WS] Bağlanılıyor:", url);
    const ws  = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Bağlantı kuruldu ✓");
      retryRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("[WS] Mesaj alındı:", msg.event, msg.data);
        if (msg.event === "workflow.snapshot" || msg.event === "workflow.update") {
          onUpdateRef.current?.(msg.data);
        }
      } catch {
        // JSON parse hatası — görmezden gel
      }
    };

    ws.onclose = (e) => {
      console.warn("[WS] Bağlantı kapandı. Kod:", e.code, "Sebep:", e.reason || "-");

      if (e.code === 4401 || e.code === 4403) return; // auth hatası → deneme yok
      if (e.code === 1000) return;                     // kasıtlı kapatma → deneme yok

      // Exponential backoff: 2s → 4s → 8s → ... → max 30s
      const delay = Math.min(2000 * Math.pow(2, retryRef.current), 30000);
      console.log(`[WS] ${delay / 1000}s sonra yeniden denenecek (${retryRef.current + 1}. deneme)`);
      retryRef.current += 1;
      timerRef.current = setTimeout(connect, delay);
    };

    ws.onerror = (err) => {
      console.error("[WS] Hata:", err);
      ws.close(); // onclose tetiklenir, oradan reconnect
    };
  }, [submissionId]);

  useEffect(() => {
    connect();

    // Sekme öne gelince bağlantıyı kontrol et, kopmuşsa yeniden bağlan
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const ws = wsRef.current;
        if (!ws || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
          console.log("[WS] Sekme aktif — yeniden bağlanılıyor");
          retryRef.current = 0;
          connect();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      wsRef.current?.close(1000); // temiz kapat (cleanup)
    };
  }, [connect]);
}
