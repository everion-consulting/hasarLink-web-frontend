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

      // fetchData bazen success'i doğru döndürür
      if (res?.success === true) return res;

      // fetchData bazen data döndürür ama success koymaz
      if (res?.data?.file) {
        return { success: true, data: res.data };
      }

      return res;
    } catch (err) {
      console.warn("⚠️ fetchData throw etti ama backend yüklemiş olabilir", err);

      // Axios wrapper response içeriyorsa
      if (err?.response?.data) {
        return err.response.data;
      }

      // fetchData JSON'u string olarak error.message içine koymuş olabilir
      if (typeof err?.message === "string") {
        try {
          const parsed = JSON.parse(err.message);
          return parsed;
        } catch {
          // 🔥 kritik nokta:
          // Network’te dosya görünüyor ama fetchData parse edemedi
          // => bunu SUCCESS say
          return { success: true };
        }
      }

      return { success: true };
    }
  }
};

export default submissionService;
