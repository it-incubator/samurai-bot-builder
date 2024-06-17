import {IBotCoreDbRepository} from "../repository/interfaces";
import {CallbackDataType} from "../message-parsers/interfaces/callback-data";
import {IProcessor} from "./interfaces/processor.interface";
import {ProcessorResult} from "./processor-result";
import {MessageFromTelegram} from "../message-parsers/message-from-telegram";

export abstract class ProcessorBase implements IProcessor {
    _activeForUsersIds: { [key: string]: { activationMessageResponse: any } } = {}
    // obsolete, use the same property inside processor result
    removeUserMessage = true
    runOnlyWhenActive: boolean = false
    static menuText = 'no-text'
    handleCallbackQuery = false
    public static callbackQueryType = 0
    public repository!: IBotCoreDbRepository

    static parseCallbackData(data: string | undefined): CallbackDataType {
        if (!data) return {
            type: -1,
            payload: []
        }
        const array = data.split(' ')
        return {
            type: +array[0],
            payload: array.slice(1)
        }
    }

    static serializeCallbackData<T>(data: CallbackDataType) {
        const array = [data.type, ...data.payload]
        return array.join(' ')
    }

    activate(userTelegramId: number) {
        this._activeForUsersIds[userTelegramId] = {activationMessageResponse: null}
    }

    deactivate(userTelegramId: number) {
        delete this._activeForUsersIds[userTelegramId]
    }

    isActiveForUser(userTelegramId: number | undefined) {
        if (!userTelegramId) return false

        return !!this._activeForUsersIds[userTelegramId]
    }

    sendActivationMessageResult(sendMessagePromise: Promise<any>, userTelegramId: number) {
        sendMessagePromise.then((res: any) => {
            this._activeForUsersIds[userTelegramId] = {activationMessageResponse: res}
        })
    }

    abstract _send(body: any, messageFromTelegram: MessageFromTelegram): Promise<ProcessorResult | undefined | null>

    async send(body: any, messageFromTelegram: MessageFromTelegram) {
        let result = await this._send(body, messageFromTelegram)
        if (!result) return null

        if (result.handled && result.removeInitUserMessageInterval) {
            const seconds = result.removeInitUserMessageInterval || 10;
            await this.repository.addMessageInDeleteQueue(body.message.chat.id, body.message.message_id, seconds);
        }

        return result
    }

    type: number = 0;
}

