
import React, { createContext, useContext, useState, useEffect } from "react";
import coreService from "../services/coreService";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await coreService.getUnreadNotificationsCount();
      console.log("📩 Unread count API yanıtı (web):", res);

      if (res?.success) {
        const count =
          typeof res.data?.count === "number" ? res.data.count : 0;
        setUnreadCount(count);
      } else {
        if (res?.message) {
          window.alert(res.message);
        }
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Unread count alınırken hata:", err);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const getUnreadCount = () => unreadCount;

  return (
    <NotificationContext.Provider
      value={{ unreadCount, getUnreadCount, fetchUnreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    // Şu an yaşadığın hatayı daha anlamlı hale getirir
    throw new Error("useNotifications, NotificationProvider içinde kullanılmalı.");
  }
  return ctx;
};
