import { fetchData } from ".";

const PATH = '/core';

const coreService = {

  async getUnreadNotificationsCount() {
    return await fetchData(`${PATH}/notifications/unread/`, 'GET');
  },

  async getNotifications() {
    return await fetchData(`${PATH}/notifications/`, 'GET');
  },

  async markNotificationAsRead(id) {
    return await fetchData(`${PATH}/notifications/${id}/mark-read/`, 'POST');
  },

  async markAllNotificationsAsRead() {
    return await fetchData(`${PATH}/notifications/mark-all-as-read/`, 'POST');
  },

  async deleteNotification(id) {
    return await fetchData(`${PATH}/notifications/${id}/delete/`, 'DELETE');
  },

  async clearAllNotifications() {
    return await fetchData(`${PATH}/notifications/clear-all/`, 'POST');
  },

};

export default coreService;
