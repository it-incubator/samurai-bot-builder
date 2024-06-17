import { BotLoggerInterface } from "../logger/interfaces"
import { BotAPI } from '../../services/bot-api'
import { wait } from "../../utils/wait"
import {IMessage} from "../message-parsers/interfaces/message";

export class Batcher {
    constructor(
        private botAPI: BotAPI,
        private logger: BotLoggerInterface,
        private batchSize: number,
        private timeoutInSecondBatchSend: number
    ) {
    }

    sendMessageToTelegramUsers = async (messages: IMessage[]) => {
        await this.logInfo("sendMessageToTelegramUsers", `Count messages for sending: ${messages.length}`);

        const promises: Promise<any>[] = [];

        for (let index = 0; index < messages.length; index++) {
            const message: IMessage = messages[index];

            const promise = this.botAPI.sendMessageWithReturnRejectedPromise(message, message.markup)
            promises.push(promise);


            if (index > 0 && index % this.batchSize === 0) {
                await wait(this.timeoutInSecondBatchSend);
            }

        }
        const result = await Promise.allSettled(promises);

        result.map(async (el) => {
            if (el.status === 'rejected') {
                const sendingData = el.reason.config?.data;
                const errorInfo = el.reason.response?.data?.description;

                await this.logError(errorInfo, "sendMessageToTelegramUsers", sendingData);
            }
        })
        return result;
    };

    private async logError(errorInfo: string, functionName: string, sendingData?: string) {
        const _sendingData = sendingData ?? "{}";
        const _errorInfo = errorInfo ?? `Error info not sent! Check your code in ${functionName}`;

        const message = `Sending data: ${_sendingData}
Error info: ${_errorInfo}
`;
        await this.logger.addError(message, Batcher.name, functionName, null);
    }

    private async logInfo(functionName: string, sendingData?: string) {
        const _sendingData = sendingData ?? "{}";
        const message = `Sending data: ${_sendingData}`;

        await this.logger.addInfo(message, Batcher.name, functionName, null);
    }
}




