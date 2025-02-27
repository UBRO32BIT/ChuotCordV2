import axiosClient from "../config/axiosClient"

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

const CreateGuildRoles = async (guildId: string, data: any) => {
    return axiosClient.post(`/guilds/${guildId}/roles`, data)
    .then((res) => {
        return res.data.data;
    })
    .catch((error) => {
        console.error(error);
        throw Error(error.response.data.message)
    })
}

const UpdateGuild = async (guildId: string, data: any) => {
    return axiosClient.patch(`/guilds/${guildId}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })
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
        return { guildId, newOwnerId };
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
    CreateGuildRoles,
    UpdateGuild,
    TransferOwnership,
}