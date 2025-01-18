import axiosClient from "./apiService";

const GetMessageByChannelId = async (guildId: string, channelId: string, before?: string) => {
    const params = before ? { before } : {};
    return axiosClient
        .get(`/guilds/${guildId}/channels/${channelId}/messages`, { params })
        .then((res) => res.data.data)
        .catch((error) => {
            console.error(error);
            throw new Error(error.response?.data?.message || "Failed to fetch messages");
        });
};

const AddMessage = async (guildId: string, channelId: string, payload: FormData) => {
    return axiosClient.post(`/guilds/${guildId}/channels/${channelId}/messages`, payload, {
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
    GetMessageByChannelId,
    AddMessage
}