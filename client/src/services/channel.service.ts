import axiosClient from "../config/axiosClient"

const CreateChannel = async (guildId: string, data: any) => {
    return axiosClient.post(`/guilds/${guildId}/channels`, data)
        .then((res) => {
            return res.data.data;
        })
        .catch((error) => {
            console.error(error);
            throw Error(error.response.data.message)
        })
}
const getChannelById = async (guildId: string, channelId: string) => {
    return axiosClient.get(`/guilds/${guildId}/channels/${channelId}`)
        .then((res) => {
            return res.data.data;
        })
        .catch((error) => {
            console.error(error);
            throw Error(error.response.data.message)
        })
}

export {
    CreateChannel,
    getChannelById,
}