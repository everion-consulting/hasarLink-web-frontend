import { fetchData } from ".";

const PATH = "/submissions";

const submissionService = {
  async uploadFile(formData) {
    try {
      const res = await fetchData(
        `${PATH}/files/`,
        "POST",
        formData,
        "multipart/form-data"
      );

      if (res?.success === true) return res;

      if (res?.data?.file) {
        return { success: true, data: res.data };
      }

      // Basarisiz durumlarda hatanin acik donmesini sagla
      return {
        success: false,
        error: res?.message || res?.data?.detail || "Dosya yuklenemedi",
      };
    } catch (err) {
      console.error("uploadFile hata:", err);

      if (err?.response?.data) {
        return {
          success: false,
          error: err.response.data?.detail || err.response.data?.message || "Sunucu hatasi",
        };
      }

      return {
        success: false,
        error: err?.message || "Baglanti hatasi",
      };
    }
  }
};

export default submissionService;
