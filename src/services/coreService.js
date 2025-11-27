import { fetchData } from ".";

const PATH = '/core';

const coreService = {

    async getNotifications() {
    return await fetchData(`${PATH}/notifications/`, 'GET');
  },


};

export default coreService;
 