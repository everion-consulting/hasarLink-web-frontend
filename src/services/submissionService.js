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

};

export default submissionService;