import { Attachment } from "./attachment.interface";
import { UserPartial } from "./user.interface";

export interface Message {
    _id: string,
    sender: UserPartial,
    type: MessageType,
    replyId: MessagePartial,
    content: string,
    attachments: Attachment[],
    timestamp: string,
}

export interface MessagePartial {
    _id: string,
    sender: UserPartial,
    type: MessageType,
    content: string,
    attachments: Attachment[],
}

export enum MessageType {
    MESSAGE = "message",
    JOIN = "join",
    LEAVE = "leave",
    OWNERSHIP = "ownership",
    KICK = "kick",
    BAN = "ban",
}