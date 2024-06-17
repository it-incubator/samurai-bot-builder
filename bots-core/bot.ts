import {BotLoggerInterface} from "./Infrastructure/logger/interfaces";
import {BotAPI} from "./services/bot-api";
import {IProcessor, ProcessorBase, ProcessorResult} from "./Infrastructure/processor";
import {IBotCoreDbRepository} from "./Infrastructure/repository/interfaces";
import {IMessage} from "./Infrastructure/message-parsers/interfaces/message";
import {MessageTypes} from "../example-bot/src/Bot/message-processors/message-types";
import {wait} from "./utils/wait";
import {ParseBody} from "./Infrastructure/message-parsers/body-parser";
import {MessageFromTelegram} from "./Infrastructure/message-parsers/message-from-telegram";


export class Bot {
    private readonly _logger: BotLoggerInterface | null = null;
    // Размер пачки сообщений при порционной отправке
    private readonly batchSize = 70;
    // Задержка в секундах между отправкой каждой пачки сообщений
    private readonly timeoutInSecondBatchSend = 1;


    _checkUnuqKeysForProcessors() {
        let tempObject: any = {}
        this.processors.forEach((p) => {
            if (!!tempObject[p.type]) throw new Error(`Incorrect non uniq processor type for processor ${p.constructor.name}`)
            else tempObject[p.type] = true
        })
        this.groupProcessors.forEach((p) => {
            if (!!tempObject[p.type]) throw new Error(`Incorrect non uniq group processor type for processor ${p.constructor.name}`)
            else tempObject[p.type] = true
        })
    }

    constructor(
        private botAPI: BotAPI,
        private processors: IProcessor[],
        private groupProcessors: IProcessor[] = [],
        private readonly repository: IBotCoreDbRepository,
        logger?: BotLoggerInterface
    ) {
        if (logger) this._logger = logger;
    }


    public async initialization() {
        this._checkUnuqKeysForProcessors();

        await this.repository.connect();

        this.processors.forEach(el => el.repository = this.repository);
        this.groupProcessors.forEach(el => el.repository = this.repository);

        this.intervalRemoverMessages();
    }

    get commonProcessors() {
        return this.processors.filter(p => !p.runOnlyWhenActive)
    }

    intervalRemoverMessages = () => {
        const interval = 5000;

        const remover = async () => {
            try {
                const messages = await this.repository.getMessagesInDeleteQueue();

                for (let i = 0; i < messages.length; i++) {
                    const el = messages[i];

                    const createdAtInMs = el.createdAt.getTime();
                    const removeIntervalInMs = el.removeInterval * 1000;
                    const dateNowInMs = Date.now();

                    if (createdAtInMs + removeIntervalInMs < dateNowInMs) {
                        await this.botAPI?.deleteMessage(el.chatId, el.messageId);
                        await this.repository.removeMessageInDeleteQueue(el._id);
                    }
                }
            } catch (e) {
                console.log(e);

            } finally {
                setTimeout(remover, interval);
            }
        }

        setTimeout(remover, interval);
    }

    sendMessageToTelegramUsers = async (messages: IMessage[], batching = false) => {
        const promises: Promise<any>[] = [];

        // итерируемся по всем сообщениям, которые нужно отправить
        for (let i = 0; i < messages.length; i++) {

            const activeProcessor: IProcessor | null = this.findAndActivateProcessor(messages[i])

            const sendMessagePromise = this.botAPI.sendMessageWithReturnRejectedPromise(messages[i], messages[i].markup)

            promises.push(sendMessagePromise);

            activeProcessor?.sendActivationMessageResult(sendMessagePromise, messages[i].messengerUserId);

            await this.delayIfNeeded(batching, i)
        }

        const result = await Promise.allSettled(promises)

        this.logRejectedResponses(result)

        return result;
    };

    broadcastPhotoWithMessageToTelegramUsers = async (message: string, photoUrl: string, telegramIds: number[]) => {
        await this.logInfo("broadcastPhotoWithMessageToTelegramUsers", `Count account for sending: ${telegramIds.length}`);

        const promises: Promise<any>[] = [];

        for (let index = 0; index < telegramIds.length; index++) {
            const id: number = telegramIds[index];

            const promise = this.botAPI.sendPhotoWithMessage(id, photoUrl, encodeURI(message));
            promises.push(promise);

            await this.delayIfNeeded(true, index)
        }
        const result = await Promise.allSettled(promises);

        result.map(async (el) => {
            if (el.status === 'rejected') {
                const sendingData = el.reason.config?.data;
                const errorInfo = el.reason.response?.data?.description;

                await this.logError(errorInfo, "broadcastPhotoWithMessageToTelegramUsers", sendingData);
            }
        })
        return result;
    };

    handleMessageFromUser = async (body: any) => {
        if (!!body.channel_post) return;

        let handled: boolean = false;
        let {parsedBody}: any = {...new ParseBody(body)};

        const messageFromTelegram = new MessageFromTelegram(body)
        const handleCallbackQueryMode = !!messageFromTelegram.callbackNotification
        const callbackType = handleCallbackQueryMode && ProcessorBase.parseCallbackData(messageFromTelegram?.callbackNotification?.callback_query?.data)

        const senderUserId = handleCallbackQueryMode ? messageFromTelegram?.callbackNotification?.callback_query.from.id : messageFromTelegram.sender?.id


        const filterFunction = (p: IProcessor) => {
            return (handleCallbackQueryMode === false && p.handleCallbackQuery === false)
                || (handleCallbackQueryMode === true && p.handleCallbackQuery === true
                    // @ts-ignore
                    && p.constructor.callbackQueryType === callbackType.type)
        }

        // если сообщение пришло внутри какого-то чата, то пытаемся обработать "групповыми" процессорами
        if (messageFromTelegram.isMessageInsideGroup) {


            const filteredProcessors = this.groupProcessors
                .filter(filterFunction)

            for (let i = 0; i < filteredProcessors.length; i++) {
                try {
                    let result = await filteredProcessors[i].send(parsedBody, messageFromTelegram);
                    if (!result) break;

                    if (result.handled) {
                        handled = true;
                        this.sendProcessorResultAsAnswerToUser(result);
                        break;
                    }
                } catch (error) {
                    console.error("Error in processor " + filteredProcessors[i].constructor.name)
                    console.error(error);
                }
            }
        } else {
            if (!!senderUserId) {
                let activeProcessor = this.processors
                    .filter(filterFunction)
                    .find(p => p.isActiveForUser(senderUserId));
                if (activeProcessor) {
                    let result = await activeProcessor?.send(parsedBody, messageFromTelegram);
                    if (!result) return null;

                    this.sendProcessorResultAsAnswerToUser(result);
                    return null;
                }
            }

            const filteredProcessors = this.commonProcessors.filter(filterFunction)

            for (let i = 0; i < filteredProcessors.length; i++) {
                try {
                    let result = await filteredProcessors[i].send(parsedBody, messageFromTelegram);
                    if (!result) break;
                    if (result.handled) {
                        handled = true;
                        this.sendProcessorResultAsAnswerToUser(result);
                        break;
                    }
                } catch (error) {
                    console.error("Error in processor " + filteredProcessors[i].constructor.name)
                    console.error(error);
                }
            }
        }


        return null;
    };

    private sendProcessorResultAsAnswerToUser(result: ProcessorResult) {
        result.messages.forEach(async (m: IMessage) => {
            await this.botAPI.sendMessage(m, m.markup);
        });
    }

    private logRejectedResponses(result: PromiseSettledResult<any>[]) {
        result.forEach((el) => {
            if (el.status === 'rejected') {
                const sendingData = el.reason.config?.data
                const errorInfo = el.reason.response?.data?.description
                this.logError(errorInfo, 'sendMessageToTelegramUsersNEW', sendingData)
            }
        })
    }

    private async delayIfNeeded(batching: boolean, index: number) {
        // отправляем с задержкой если true
        if (batching) {
            // после каждого this.batchSize-ного элемента делаем задержку (если  batchSize = 12, то задержка будет после 12, 24, 36...)
            if (index > 0 && index % this.batchSize === 0) {
                await wait(this.timeoutInSecondBatchSend)
            }
        }
    }

    private findAndActivateProcessor(message: IMessage) {
        let activeProcessor: IProcessor | null = null;
        // если есть messageType, то нужно соответствующий процессор сделать активным
        if (message.messageType != MessageTypes.No) { /* todo: !== но нужно быть осторожным, потому что клиенты извне могут прислать не тот тип данных */
            for (const processor of this.processors) {
                if (message.messageType == processor.type) {
                    activeProcessor = processor
                    processor.activate(message.messengerUserId)
                } else {
                    processor.deactivate(message.messengerUserId)
                }
            }
        }
        return activeProcessor
    }

    private async logError(errorInfo: string, functionName: string, sendingData?: string) {
        const _sendingData = sendingData ?? "{}";
        const _errorInfo = errorInfo ?? `Error info not sent! Check your code in ${functionName}`;

        if (this._logger !== null) {
            const message = `Sending data: ${_sendingData}
Error info: ${_errorInfo}
`;
            await this._logger.addError(message, "Bot", functionName, null);
        }
    }

    private async logInfo(functionName: string, sendingData?: string) {
        const _sendingData = sendingData ?? "{}";

        if (this._logger !== null) {
            const message = `Sending data: ${_sendingData}`;
            await this._logger.addInfo(message, "Bot", functionName, null);
        }
    }
}




