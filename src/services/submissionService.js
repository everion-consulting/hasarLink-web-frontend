import { fetchData } from ".";

const PATH = '/submissions';

const submissionService = {

    async uploadFile(formData) {
        return await fetchData(
            `${PATH}/files/`,
            'POST',
            formData,
            'multipart/form-data',
        );
    },
    async getSubmissionFiles(fileId) {
    return await fetchData(`${PATH}/files/by-submission/${fileId}/`, 'GET');
  },

};

export default submissionService;