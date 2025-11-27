import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import coreService from "../../services/coreService";
import "../../styles/notificationScreen.css";

const NotificationsScreen = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const getUnreadCount = () => notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await coreService.getNotifications();

      if (response.success) {
        setNotifications(response?.data?.results || []);
      } else {
        console.error("API response error:", response.status);
        window.alert(response.message || "Bildirimler yüklenemedi");
      }
    } catch (err) {
      console.error("Bildirimler alınamadı:", err);
      window.alert("Bağlantı hatası oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const response = await coreService.markNotificationAsRead(id);

      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      } else {
        window.alert(response.message || "Bildirim okundu olarak işaretlenemedi");
      }
    } catch (err) {
      console.error("Mark-as-read hatası:", err);
    }
  };

  const openNotificationDetail = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedNotification(null);
  };

  const markAllAsRead = async () => {
    try {
      const response = await coreService.markAllNotificationsAsRead();

      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        window.alert("Tüm bildirimler okundu işaretlendi");
      } else {
        window.alert(response.message || "İşlem başarısız oldu");
      }
    } catch (err) {
      console.error("markAllAsRead hatası:", err);
      window.alert("Bağlantı hatası oluştu");
    }
  };

  const deleteNotification = (id) => {
    if (window.confirm("Bu bildirimi silmek istediğinizden emin misiniz?")) {
      performDelete(id);
    }
  };

  const performDelete = async (id) => {
    try {
      setDeletingIds((prev) => [...prev, id]);
      const response = await coreService.deleteNotification(id);

      if (response.status === 204 || response.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (selectedNotification && selectedNotification.id === id) {
          closeModal();
        }
      } else {
        window.alert(response.message || "Bildirim silinemedi");
      }
    } catch (err) {
      console.error("Bildirim silme hatası:", err);
      window.alert("Bağlantı hatası oluştu");
    } finally {
      setDeletingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const renderNotificationItem = (notification) => {
    const isDeleting = deletingIds.includes(notification.id);

    return (
      <div
        key={notification.id}
        className={
          "notif-item" +
          (!notification.is_read ? " notif-item--unread" : "") +
          (isDeleting ? " notif-item--deleting" : "")
        }
        onClick={() => openNotificationDetail(notification)}
      >
        <div className="notif-item__left">
          <div className="notif-item__icon" />
          <div className="notif-item__text">
            <div className="notif-item__title">
              {notification.title || "Yeni Bildirim"}
            </div>
            <div className="notif-item__message">{notification.message}</div>
            <div className="notif-item__time">
              {notification.time_ago ||
                new Date(notification.created_at).toLocaleString("tr-TR")}
            </div>
          </div>
        </div>

        <div
          className="notif-item__delete"
          onClick={(e) => {
            e.stopPropagation();
            deleteNotification(notification.id);
          }}
        >
          ×
        </div>
      </div>
    );
  };

  return (
    <div className="screen-container-drive">
      <div className="content-area">
        {/* Sol geri ok */}
        <button
          type="button"
          className="notif-back-btn"
          onClick={() => navigate(-1)}
        >
          ←
        </button>

        {/* Başlık */}
        <h1 className="page-title">BİLDİRİMLER</h1>

        {/* Ortadaki beyaz kart (Araç Bilgileri kartı gibi) */}
        <div className="vehicle-form-card notif-card">
          <div className="notif-card__header">
            <div className="notif-card__section-left">
              <span className="notif-card__section-title">Yeni</span>
              <span className="notif-card__badge">{getUnreadCount()}</span>
            </div>

            <button
              type="button"
              className="notif-card__mark-all"
              onClick={markAllAsRead}
            >
              Tümünü Okundu İşaretle
            </button>
          </div>

          {loading && notifications.length === 0 ? (
            <div className="notif-loading">
              <div className="notif-spinner" />
              <span>Yükleniyor...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notif-empty">Henüz bildiriminiz yok</div>
          ) : (
            <div className="notif-list">
              {notifications.map(renderNotificationItem)}
            </div>
          )}
        </div>
      </div>

      {/* Detay modalı */}
      {modalVisible && selectedNotification && (
        <div className="notif-modal-overlay" onClick={closeModal}>
          <div
            className="notif-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="notif-modal__header">
              <h2>Bildirim Detayı</h2>
              <button
                className="notif-modal__close"
                onClick={closeModal}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="notif-modal__body">
              <div className="notif-detail">
                <div className="notif-detail__label">Başlık</div>
                <div className="notif-detail__value">
                  {selectedNotification.title || "Yeni Bildirim"}
                </div>
              </div>

              <div className="notif-detail">
                <div className="notif-detail__label">Mesaj</div>
                <div className="notif-detail__message">
                  {selectedNotification.message}
                </div>
              </div>

              <div className="notif-detail">
                <div className="notif-detail__label">Tarih</div>
                <div className="notif-detail__value">
                  {new Date(
                    selectedNotification.created_at
                  ).toLocaleString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="notif-detail">
                <div className="notif-detail__label">Durum</div>
                <div
                  className={
                    "notif-detail__status" +
                    (selectedNotification.is_read
                      ? " notif-detail__status--read"
                      : " notif-detail__status--unread")
                  }
                >
                  {selectedNotification.is_read ? "Okundu" : "Okunmadı"}
                </div>
              </div>
            </div>

            <div className="notif-modal__footer">
              <button
                type="button"
                className="notif-modal__btn notif-modal__btn--delete"
                onClick={() => deleteNotification(selectedNotification.id)}
              >
                Bildirimi Sil
              </button>

              <button
                type="button"
                className="notif-modal__btn notif-modal__btn--primary"
                onClick={() => {
                  closeModal();
                  if (selectedNotification.object_id) {
                    navigate(`/files/${selectedNotification.object_id}`);
                  } else {
                    window.alert("Bu bildirim bir dosyaya bağlı değil.");
                  }
                }}
              >
                Dosyaya Git
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsScreen;
