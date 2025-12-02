import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import coreService from "../../services/coreService";
import styles from "../../styles/notificationScreen.module.css";
import LeftBlackIcon from "../../assets/images/leftIconBlack.svg";

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
          `${styles.notifItem} ` +
          `${!notification.is_read ? styles.notifItemUnread : ""} ` +
          `${isDeleting ? styles.notifItemDeleting : ""}`
        }
        onClick={() => openNotificationDetail(notification)}
      >
        <div className={styles.notifItemLeft}>
          <div className={styles.notifItemIcon} />
          <div className={styles.notifItemText}>
            <div className={styles.notifItemTitle}>
              {notification.title || "Yeni Bildirim"}
            </div>
            <div className={styles.notifItemMessage}>
              {notification.message}
            </div>
            <div className={styles.notifItemTime}>
              {notification.time_ago ||
                new Date(notification.created_at).toLocaleString("tr-TR")}
            </div>
          </div>
        </div>

        <div
          className={styles.notifItemDelete}
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
    <div className={styles.notifPage}>
      <div className={styles.contentArea}>
        <div className={styles.notifHeader}>
          <button
            type="button"
            className={styles.notifBackBtn}
            onClick={() => navigate(-1)}
          >
            <span className={styles.contactBtnIcon}>
              <img src={LeftBlackIcon} alt="Geri" />
            </span>
          </button>

          <h1 className={styles.pageTitle}>BİLDİRİMLER</h1>
        </div>

        <div className={`${styles.vehicleFormCard} ${styles.notifCard}`}>
          <div className={styles.notifCardHeader}>
            <div className={styles.notifCardSectionLeft}>
              <span className={styles.notifCardSectionTitle}>Yeni</span>
              <span className={styles.notifCardBadge}>{getUnreadCount()}</span>
            </div>

            <button
              type="button"
              className={styles.notifCardMarkAll}
              onClick={markAllAsRead}
            >
              Tümünü Okundu İşaretle
            </button>
          </div>

          {loading && notifications.length === 0 ? (
            <div className={styles.notifLoading}>
              <div className={styles.notifSpinner} />
              <span>Yükleniyor...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className={styles.notifEmpty}>Henüz bildiriminiz yok</div>
          ) : (
            <div className={styles.notifList}>
              {notifications.map(renderNotificationItem)}
            </div>
          )}
        </div>
      </div>

      {modalVisible && selectedNotification && (
        <div
          className={styles.notifModalOverlay}
          onClick={closeModal}
        >
          <div
            className={styles.notifModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.notifModalHeader}>
              <h2>Bildirim Detayı</h2>
              <button
                className={styles.notifModalClose}
                onClick={closeModal}
                type="button"
              >
                ×
              </button>
            </div>

            <div className={styles.notifModalBody}>
              <div className={styles.notifDetail}>
                <div className={styles.notifDetailLabel}>Başlık</div>
                <div className={styles.notifDetailValue}>
                  {selectedNotification.title || "Yeni Bildirim"}
                </div>
              </div>

              <div className={styles.notifDetail}>
                <div className={styles.notifDetailLabel}>Mesaj</div>
                <div className={styles.notifDetailMessage}>
                  {selectedNotification.message}
                </div>
              </div>

              <div className={styles.notifDetail}>
                <div className={styles.notifDetailLabel}>Tarih</div>
                <div className={styles.notifDetailValue}>
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

              <div className={styles.notifDetail}>
                <div className={styles.notifDetailLabel}>Durum</div>
                <div
                  className={
                    selectedNotification.is_read
                      ? styles.notifDetailStatusRead
                      : styles.notifDetailStatusUnread
                  }
                >
                  {selectedNotification.is_read ? "Okundu" : "Okunmadı"}
                </div>
              </div>
            </div>

            <div className={styles.notifModalFooter}>
              <button
                type="button"
                className={`${styles.notifModalBtn} ${styles.notifModalBtnDelete}`}
                onClick={() => deleteNotification(selectedNotification.id)}
              >
                Bildirimi Sil
              </button>

              <button
                type="button"
                className={`${styles.notifModalBtn} ${styles.notifModalBtnPrimary}`}
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
