import { fetchData } from ".";



const PATH = '/api';

const sanitizeSubmissionDateTime = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return value;

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(raw)) {
    return raw;
  }

  const dateMatch = raw.match(/(\d{4}[-\/.]\d{2}[-\/.]\d{2}|\d{2}[-\/.]\d{2}[-\/.]\d{4})/);
  const timeMatch = raw.match(/(\d{1,2}[:.]\d{1,2}(?:[:.]\d{1,2})?|\b\d{4,6}\b)/);

  if (!dateMatch || !timeMatch) {
    return value;
  }

  const dateRaw = dateMatch[1].replace(/\//g, '.');
  let normalizedDate = '';

  if (/^\d{4}[-\.]\d{2}[-\.]\d{2}$/.test(dateRaw)) {
    normalizedDate = dateRaw.replace(/\./g, '-');
  } else if (/^\d{2}[.-]\d{2}[.-]\d{4}$/.test(dateRaw)) {
    const [day, month, year] = dateRaw.split(/[.-]/);
    normalizedDate = `${year}-${month}-${day}`;
  }

  const timeDigits = timeMatch[1].replace(/[^\d]/g, '');
  const timeParts = timeDigits.match(/^(\d{2})(\d{2})(\d{2})?$/);

  if (!normalizedDate || !timeParts) {
    return value;
  }

  const [, hours, minutes, seconds = '00'] = timeParts;
  if (Number(hours) > 23 || Number(minutes) > 59 || Number(seconds) > 59) {
    return value;
  }

  return `${normalizedDate}T${hours}:${minutes}:${seconds}`;
};

const sanitizeSubmissionPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;

  if (!Object.prototype.hasOwnProperty.call(payload, 'accident_date')) {
    return payload;
  }

  return {
    ...payload,
    accident_date: sanitizeSubmissionDateTime(payload.accident_date),
  };
};

const apiService = {
  async createSubmission(payload) {
    return await fetchData(
      `${PATH}/submissions/`,
      'POST',
      sanitizeSubmissionPayload(payload),
      'application/json',
    );
  },

  async updateSubmission(id, payload) {
    return await fetchData(
      `${PATH}/submissions/${id}/`,
      'PATCH',
      sanitizeSubmissionPayload(payload),
      'application/json',
    );
  },


  async getAllSubmissions(isCompleted = null) {
    let url = `${PATH}/submissions/`;

    if (isCompleted !== false) {
      url += `?is_completed=true`;
    } else if (isCompleted === false) {
      url += `?is_completed=false`;
    }

    return await fetchData(url, 'GET');
  },


  async getSubmissionDetail(fileId) {
    return await fetchData(`${PATH}/submissions/${fileId}/`, 'GET');
  },

  async getSubmissionStats(period = "DAILY") {
    return await fetchData(`${PATH}/submission-stats/?period=${period}`, "GET");
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

  // 🔹 Anlaşmalı servis bilgilerini getir
  async getInsuranceCredentials() {
    return await fetchData(`${PATH}/insurance-credentials/`, "GET");
  },

  // 🔹 Yeni kayıt oluştur
  async createInsuranceCredential(body) {
    return await fetchData(
      `${PATH}/insurance-credentials/`,
      "POST",
      body,
      "application/json"
    );
  },

  // 🔹 Güncelle
  async updateInsuranceCredential(companyId, body) {
    return await fetchData(
      `${PATH}/insurance-credentials/${companyId}/`,
      "PUT",
      body,
      "application/json"
    );
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

  // -------------------- İŞ AKIŞI -------------------- //

  async assignExpert(submissionId, payload) {
    return await fetchData(
      `${PATH}/submissions/${submissionId}/expert-assignment/`,
      'POST', payload, 'application/json'
    );
  },

  async getRepairStages(submissionId) {
    return await fetchData(
      `${PATH}/submissions/${submissionId}/repair-stages/`,
      'GET'
    );
  },

  async addRepairStage(submissionId, payload) {
    return await fetchData(
      `${PATH}/submissions/${submissionId}/repair-stages/`,
      'POST', payload, 'application/json'
    );
  },

  async createExpertReport(submissionId, payload) {
    return await fetchData(
      `${PATH}/submissions/${submissionId}/expert-report/`,
      'POST', payload, 'application/json'
    );
  },

  async updateExpertReport(submissionId, payload) {
    return await fetchData(
      `${PATH}/submissions/${submissionId}/expert-report/`,
      'PATCH', payload, 'application/json'
    );
  },

  async createInsurancePayment(submissionId, payload) {
    return await fetchData(
      `${PATH}/submissions/${submissionId}/insurance-payment/`,
      'POST', payload, 'application/json'
    );
  },

  async updateInsurancePayment(submissionId, payload) {
    return await fetchData(
      `${PATH}/submissions/${submissionId}/insurance-payment/`,
      'PATCH', payload, 'application/json'
    );
  },

  async advanceWorkflow(submissionId, workflowStage) {
    return await fetchData(
      `${PATH}/submissions/${submissionId}/advance-workflow/`,
      'POST', { workflow_stage: workflowStage }, 'application/json'
    );
  },

  async getManagementDashboard(period = "WEEKLY", date = null) {
    let url = `${PATH}/management-dashboard/?period=${period}`;
    if (date) url += `&date=${date}`;
    return await fetchData(url, 'GET');
  },

  async getDashboardAIAnalysisStream(dashboardData, onChunk) {
    const token = localStorage.getItem("authToken");
    const baseUrl = import.meta.env.VITE_API_BASE || "https://dosya-bildirim-vrosq.ondigitalocean.app";
    const resp = await fetch(`${baseUrl}${PATH}/management-dashboard/ai-analysis/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
      body: JSON.stringify({ dashboard_data: dashboardData }),
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let full = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      full += chunk;
      if (onChunk) onChunk(full);
    }

    return full;
  },

  async fieldUserAPI(payload) {
    console.log("fieldUserAPI çalıştı");

    const response = await fetch(
      "https://dosya-bildirim-vrosq.ondigitalocean.app/api/field-user/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    return {
      success: response.ok,
      status: response.status,
      data,
      message:
        data?.detail ||
        data?.message ||
        (typeof data === "string" ? data : response.statusText),
    };
  }


};

export default apiService;