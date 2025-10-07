import axiosClient from "../config/axiosClient";

const GetInvitesByGuildId = async (guildId: string) => {
    return axiosClient.get(`/guilds/${guildId}/invites`)
        .then((res) => {
            return res.data.data;
        })
        .catch((error) => {
            console.error(error);
            throw Error(error.response.data.message)
        })
}

const GenerateInvite = async (guildId: string, expiration: string) => {
    return axiosClient
        .post(`/guilds/${guildId}/invites`, { expiration })
        .then((res) => res.data.data)
        .catch((error) => {
            console.error(error);
            throw Error(error.response?.data?.message || "Failed to create invite");
        });
};

const GetInviteByCode = async (code: string) => {
    return axiosClient.get(`/invites/${code}`)
        .then((res) => {
            return res.data.data;
        })
        .catch((error) => {
            console.error(error);
            throw Error(error.response.data.message)
        })
}

const JoinGuildByCode = async (code: string) => {
    return axiosClient.post(`/invites/${code}`)
        .then((res) => {
            return res.data.data;
        })
        .catch((error) => {
            console.error(error);
            throw Error(error.response.data.message)
        })
}

export {
    GetInvitesByGuildId,
    GetInviteByCode,
    GenerateInvite,
    JoinGuildByCode
}