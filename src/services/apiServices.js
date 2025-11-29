import { fetchData } from ".";



const PATH = '/api';

const apiService = {
  async createSubmission(payload) {
    return await fetchData(
      `${PATH}/submissions/`,
      'POST',
      payload,
      'application/json',
    );
  },

  async updateSubmission(id, payload) {
    return await fetchData(
      `${PATH}/submissions/${id}/`,
      'PATCH',
      payload,
      'application/json',
    );
  },


  async getAllSubmissions() {
    return await fetchData(`${PATH}/submissions/`, 'GET');
  },

  async getSubmissionDetail(fileId) {
    return await fetchData(`${PATH}/submissions/${fileId}/`, 'GET');
  },

  async getPendingSubmissions() {
    return await fetchData(`${PATH}/pending-file-view/`, 'GET');
  },

  async getFileSubmissionCounts() {
    return await fetchData(`${PATH}/file-submissions-list/`, 'GET');
  },

  async getRejectedSubmissions() {
    return await fetchData(`${PATH}/rejected-file-submission/`, 'GET');
  },


  async getNotifiedSubmissions() {
    return await fetchData(`${PATH}/in-progress-list/`, 'GET');
  },

  async getMonthlySubmissions() {
    return await fetchData(`${PATH}/monthly-list-all/`, 'GET');
  },

  async getCompletedSubmissions() {
    return await fetchData(`${PATH}/completed-list/`, 'GET');
  },

  async changeSubmissionStatus(fileId, newStatus) {
    // DOĞRU: alan adı 'status' olmalı
    const body = { status: newStatus };
    return await fetchData(
      `${PATH}/submissions/${fileId}/`, // sonda / var
      'PATCH',
      body,
      'application/json'
    );
  },

  async replaceFile(fileId, formData) {
    return await fetchData(
      `${PATH}/submissions/files/${fileId}/`,
      'PUT',
      formData,
      'multipart/form-data',
    );
  },

  async deleteFile(fileId) {
    return await fetchData(`${PATH}/submissions/files/${fileId}/`, 'DELETE');
  },

  async getDrafts(page = 1, selectedDate = null) {
    let url = `${PATH}/submissions/drafts/?page=${page}`;
    if (selectedDate) {
      url += `&created_at__date=${selectedDate}`;
    }
    console.log("getDrafts API URL:", url);
    return await fetchData(url, 'GET');
  },

  async getDraft(draftId) {
    return await fetchData(`${PATH}/submissions/${draftId}/`, 'PATCH');
  },

  async getDraftDetail(draftId) {
    return await fetchData(`${PATH}/submissions/drafts/${draftId}/`, 'GET');
  },

  async updateDraftStatus(draftId, isCompleted = false) {
    const body = { is_completed: isCompleted };
    return await fetchData(
      `${PATH}/submissions/${draftId}/`,
      'PATCH',
      body,
      'application/json',
    );
  },

  async deleteDraft(draftId) {
    return await fetchData(`${PATH}/submissions/drafts/${draftId}/`, 'DELETE');
  },



  async getProfile() {
    return await fetchData(`${PATH}/profile/`, 'GET');
  },

  async getProfileDetail() {
    return await fetchData(`${PATH}/profile/detail/`, 'GET');
  },

  async uploadAvatar(formData) {
    return await fetchData(
      `${PATH}/profile/detail/`,
      'PATCH',
      formData,
      'multipart/form-data',
    );
  },

  async uploadFile(formData) {
    return await fetchData(
      `${PATH}/submissions/files/`,
      'POST',
      formData,
      'multipart/form-data',
    );
  },

  async updateProfileDetail(body) {
    return await fetchData(
      `${PATH}/profile/detail/`,
      'PATCH',
      body,
      'application/json',
    );
  },

  async addFavoriteCompany(companyId) {
    const body = { company_id: companyId };
    return await fetchData(
      `${PATH}/profile/detail/add-favorite/`,
      'POST',
      body,
      'application/json',
    );
  },

  async removeFavoriteCompany(companyId) {
    const body = { company_id: companyId };
    return await fetchData(
      `${PATH}/profile/detail/remove-favorite/`,
      'POST',
      body,
      'application/json',
    );
  },

  async getAllInsuranceCompanies() {
    return await fetchData(`${PATH}/insurance-companies/`, 'GET');
  },

  async getPaginationInsuranceCompanies() {
    let allCompanies = [];
    let nextUrl = `${PATH}/insurance-companies/`;

    while (nextUrl) {
      const res = await fetchData(nextUrl, 'GET');

      if (!res.success) {
        break;
      }

      const data = res.data;

      if (Array.isArray(data.results)) {
        allCompanies = [...allCompanies, ...data.results];
      }

      nextUrl = data.next
        ? data.next.replace(
          'https://dosya-bildirim-vrosq.ondigitalocean.app',
          '',
        )
        : null;
    }

    return allCompanies;
  },

  async getCities(url = null) {
    if (url) {
      const cleanUrl = url.replace(
        'https://dosya-bildirim-vrosq.ondigitalocean.app',
        '',
      );
      return await fetchData(cleanUrl, 'GET');
    }
    return await fetchData(`${PATH}/cities/`, 'GET');
  },

  async getRejectedFirstStepDropdowns() {
    return await fetchData(`${PATH}/update-rejected-first-step/`, 'GET');
  },

  async getUserStatistics() {
    return await fetchData(`${PATH}/pending-progress-view/`, 'GET');
  },

  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`https://dosya-bildirim-vrosq.ondigitalocean.app/api/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      });

      const data = await res.json();
      return { success: res.ok, data };
    } catch (error) {
      return { success: false, error };
    }
  },
  // CONTACT FORM — WEB
  async sendContactForm(payload) {
    return await fetchData(
      `/accounts/contact-forms/`,
      "POST",
      payload,
      "application/json"
    );
  },

};

export default apiService;