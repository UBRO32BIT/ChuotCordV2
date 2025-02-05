import axiosClient from "./apiService"

const GetGuilds = async () => {
    return axiosClient.get(`/guilds`)
    .then((res) => {
        return res.data.data.docs;
    })
    .catch((error) => {
        console.error(error);
        throw Error(error.response.data.message)
    })
}

const GetGuildById = async (guildId: string) => {
    return axiosClient.get(`/guilds/${guildId}`)
    .then((res) => {
        return res.data.data;
    })
    .catch((error) => {
        console.error(error);
        throw Error(error.response.data.message)
    })
}

const CreateGuild = async (data: any) => {
    return axiosClient.post(`/guilds`, data)
    .then((res) => {
        return res.data.data;
    })
    .catch((error) => {
        console.error(error);
        throw Error(error.response.data.message)
    })
}

const DeleteGuild = async (guildId: string) => {
    return axiosClient.delete(`/guilds/${guildId}`)
    .then((res) => {
        return res.data.data;
    })
    .catch((error) => {
        console.error(error);
        throw Error(error.response.data.message)
    })
}

const GetGuildRoles = async (guildId: string) => {
    return axiosClient.get(`/guilds/${guildId}/roles`)
    .then((res) => {
        return res.data.data;
    })
    .catch((error) => {
        console.error(error);
        throw Error(error.response.data.message)
    })
}

const UpdateGuild = async (guildId: string, data: any) => {
    return axiosClient.patch(`/guilds/${guildId}`, data)
    .then((res) => {
        return res.data.data;
    })
    .catch((error) => {
        console.error(error);
        throw Error(error.response.data.message);
    });
};

const TransferOwnership = async (guildId: string, newOwnerId: string) => {
    return axiosClient.patch(`/guilds/${guildId}/transfer-ownership`, { newOwnerId })
    .then((res) => {
        return res.data.data;
    })
    .catch((error) => {
        console.error(error);
        throw Error(error.response.data.message);
    });
};

export {
    GetGuilds,
    GetGuildById,
    CreateGuild,
    DeleteGuild,
    GetGuildRoles,
    UpdateGuild,
    TransferOwnership,
}