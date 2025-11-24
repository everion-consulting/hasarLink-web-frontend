import { fetchData } from ".";

const PATH = '/accounts';

const accountServices = {
  async updateNotificationPreferences(
    push,
    email,
    status_change,
    reminder,
    marketing,
  ) {
    return await fetchData(
      `${PATH}/user/notification-preferences/`,
      'PATCH',
      {
        push,
        email,
        status_change,
        reminder,
        marketing,
      },
      'application/json',
    );
  },

  async sendContactForm(payload) {
    return await fetchData(
      `${PATH}/contact-forms/`,
      'POST',
      payload,
      'application/json',
    );
  },
};

export default accountServices;
