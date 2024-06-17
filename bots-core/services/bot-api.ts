import axios from 'axios'
import {IBotCoreDbRepository} from "../Infrastructure/repository/interfaces";
import {IMessage, MessageBodyTypes} from "../Infrastructure/message-parsers/interfaces/message";

export type InlineKeyboardButtonType = {
    text: string
    url?: string
    callback_data?: string
}
export type KeyboardButtonType = {
    text: string
}


export type InlineKeyboardType = { inline_keyboard: Array<Array<InlineKeyboardButtonType>> }
export type KeyboardType = { keyboard: Array<Array<KeyboardButtonType>> }

export class BotAPI {
    botAxiosInst: any

    constructor(private token: string, private repository: IBotCoreDbRepository, private secret_token: string) {
        this.botAxiosInst = axios.create({
            baseURL:
                `https://api.telegram.org/bot${this.token}`
        })
    }

    createWebHook(url: string) {
        return this.botAxiosInst.post(`/setWebhook`, {url, secret_token: this.secret_token})
    }

    sendPhoto(id: number, photoId: string) {
        return this.botAxiosInst.post(`/sendPhoto?chat_id=${id}&photo=${photoId}`)
    }

    sendPhotoWithMessage(id: number, photoId: string, caption: string) {
        return this.botAxiosInst.post(`/sendPhoto?chat_id=${id}&photo=${photoId}&caption=${caption}&parse_mode=Html`)
    }

    sendVoice(id: string, fileId: string) {
        return this.botAxiosInst.post(`/sendVoice?chat_id=${id}&file_id=${fileId}&duration=120`)
    }

    forwardMessage(chat_id: string, from_chat_id: string, message_id: number) {
        return this.botAxiosInst.post(`/forwardMessage?chat_id=${chat_id}&from_chat_id=${from_chat_id}&message_id=${message_id}`)
    }

    sendVideo(chat_id: string, video: string) {
        //length -> length diameter of the video message as defined by sender
        return this.botAxiosInst.post(`/sendVideo?chat_id=${chat_id}&video=${video}`)
    }

    sendVideoNote(chat_id: string, video_note: string) {
        //length -> length diameter of the video message as defined by sender
        return this.botAxiosInst.post(`/sendVideoNote?chat_id=${chat_id}&video_note=${video_note}`)
    }


    sendMessage(message: IMessage, markup: InlineKeyboardType | KeyboardType | null = null) {
        const resultPromise: any = this.sendMessageWithReturnRejectedPromise(message, markup);
        return resultPromise
            .then((data: any) => data)
    }

    sendMessageWithReturnRejectedPromise(message: IMessage, markup: InlineKeyboardType | KeyboardType | null = null) {
        let data: any = {
            chat_id: message.messengerUserId,
            text: message.message,
            //reply_markup: markup
        }
        if (markup) {

            // @ts-ignore
            markup.inline_keyboard && markup.inline_keyboard.forEach(row => {
                row.forEach((b: InlineKeyboardButtonType) => {
                    if (!b.url) delete b.url;
                    if (b.callback_data == null) delete b.callback_data;
                })
            })


            data.reply_markup = markup
        }

        if (message.bodyType == MessageBodyTypes.Html) {
            data.parse_mode = 'html'
        }
        return this.botAxiosInst.post(`/sendMessage`, data)
            .then((res: any) => {

                if (res && message.autoRemoveAfterSeconds) {
                    this.repository.addMessageInDeleteQueue(message.messengerUserId, res.data.result.message_id, message.autoRemoveAfterSeconds);
                }
                return res.data
            })
            .catch((error: any) => {
                console.error(error);
                return Promise.reject(error);
            })
    }


    deleteMessage(chatId: number, messageId: number) {
        this.botAxiosInst.post(`/deleteMessage`, {chat_id: chatId, message_id: messageId})
            .then((res: any) => {
            }).catch((error: any) => {
        })
    }

    kickChatMember(id: number, userId: number) {
        return this.botAxiosInst.post(`/kickChatMember?chat_id=${id}&user_id=${userId}`).then((res: any) => {
            return res.data
        })
    }

    unbanChatMember(id: number, userId: number) {
        return this.botAxiosInst.get(`/unbanChatMember?chat_id=${id}&user_id=${userId}`).then((res: any) => {
            return res.data
        })
    }

    getChatMember(id: number, userId: number) {
        return this.botAxiosInst.get(`/getChatMember?chat_id=${id}&user_id=${userId}`).then((res: any) => {
            return res.data
        })
    }

    getChat(chatId: number) {
        return this.botAxiosInst.get(`/getChat?chat_id=${chatId}`).then((res: any) => {
            return res.data
        }).catch((err: any) => ({error: 'no data'}))
    }

    getFileUrl(fileId: string) {
        return this.botAxiosInst.get(`https://api.telegram.org/bot${this.token}/getFile?file_id=${fileId}`)
            .then((res: any) => {
                return `https://api.telegram.org/file/bot${this.token}/${res.data.result.file_path}`
            })
    }

    async createInviteLink(chatId: number) {
        try {
            return await this.botAxiosInst.post(`/exportChatInviteLink`, {chat_id: chatId}).then((r: any) => r.data.result)
        } catch (error) {
            return error;
        }
    }
}




