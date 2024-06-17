import {IProcessor, ProcessorBase, ProcessorResult} from "../../../../bots-core/Infrastructure/processor";
import {MessageFromTelegram} from "../../../../bots-core/Infrastructure/message-parsers/message-from-telegram";
import {Message} from "../../../../bots-core/Infrastructure/message-parsers/message";
import {MessageTypes} from "./message-types";


export class GetChatIdProcessor extends ProcessorBase implements IProcessor {
    type: MessageTypes = MessageTypes.GetChatId;

    async _send(body: any, messageFromTelegram: MessageFromTelegram): Promise<ProcessorResult> {

        let handled = false;
        let message = "";
        let id = 0;

        if (body.message && body.message.text === "/this_chat_id") {
            handled = true;
            message = body.message.chat.id;
            id = messageFromTelegram.sender?.id || 0;
        }

        return new ProcessorResult([new Message(message, id, null)], handled);
    };
}


