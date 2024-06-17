import {IBotCoreDbRepository} from "../../repository/interfaces";
import {ProcessorResult} from "../processor-result";
import {MessageFromTelegram} from "../../message-parsers/message-from-telegram";

export interface IProcessor {
    send: (bodyFromTelegram: any, messageFromTelegram: MessageFromTelegram) => Promise<ProcessorResult | undefined | null>
    type: number
    isActiveForUser: (userTelegramId: number | undefined) => boolean
    activate: (userTelegramId: number) => void
    deactivate: (userTelegramId: number) => void
    runOnlyWhenActive: boolean
    handleCallbackQuery: boolean
    repository: IBotCoreDbRepository;

    sendActivationMessageResult(res: any, userTelegramId: number): void;
}