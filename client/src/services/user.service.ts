import axiosClient from "./apiService";

const getGuildsByUserId = async () => {
    return axiosClient.get(`/users/guilds`)
        .then((res) => {
            return res.data.data;
        })
        .catch((error) => {
            console.error(error);
            throw Error(error.response.data.message)
        })
}

const changePassword = async (oldPassword: string, newPassword: string) => {
    return axiosClient.post(`/users/change-password`, {
        oldPassword,
        newPassword
    })
        .then((res) => {
            return res.data.data;
        })
        .catch((error) => {
            console.error(error);
            throw Error(error.response.data.message)
        })
}

const updateInformation = async (data: any) => {
    return axiosClient.patch(`/users/update`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })
        .then((res) => {
            return res.data.data;
        })
        .catch((error) => {
            console.error(error);
            throw Error(error.response.data.message)
        })
}

export {
    getGuildsByUserId,
    changePassword,
    updateInformation
}