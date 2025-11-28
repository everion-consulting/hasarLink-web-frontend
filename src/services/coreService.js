import { fetchData } from ".";

const PATH = '/core';

const coreService = {

    async getNotifications() {
    return await fetchData(`${PATH}/notifications/`, 'GET');
  },

  async getUnreadNotificationsCount() {
    return await fetchData(`${PATH}/notifications/unread/`, 'GET');
  },

};

export default coreService;
 