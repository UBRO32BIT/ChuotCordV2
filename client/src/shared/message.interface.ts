import { Attachment } from "./attachment.interface";
import { UserPartial } from "./user.interface";

export interface Message {
    _id: string,
    sender: UserPartial,
    reply_id?: string,
    content: string,
    attachments: Attachment[],
    timestamp: string,
}