import { Message } from "./message.interface"
import { User } from "./user.interface"

export interface GuildPartial {
    _id: string,
    name: string,
    image: string | null,
    memberCounts: number,
}

export interface Guild {
    _id: string,
    name: string,
    owner: string,
    image: string | null,
    roles: Role[],
    members: Member[],
    channels: ChannelPartial[]
}

export interface Role {
    _id: string,
    name: string,
    color: string,
    permissionCodes: string[],
    displayType: string,
}
export interface Member {
    _id: string,
    roles: Role[],
    memberId: Partial<User>,
    timestamp: Date,
}
export interface ChannelPartial {
    _id: string,
    name: string,
    type: string,
}
export interface Channel {
    _id: string,
    name: string,
    roles: Role[],
    messages: Message[],
    type: string,
}
export interface InvitePartial {
    _id: string,
    string: string,
}
export interface Invite {
    _id: string,
    string: string,
    creator: any,
    guild: any,
}