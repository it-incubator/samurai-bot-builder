import SECURITY_CONSTANTS from './Bot/constants/security-constants'
import {BotAPI} from '../../bots-core/services/bot-api'
import {Bot} from '../../bots-core/bot'
import mongoose from 'mongoose'
import {ConsoleLogger} from "../../bots-core/Infrastructure/logger/console-logger";
import express from 'express'
import rootRouter from "./Bot/routers/root.router";
import {
    BotCoreMongoDatabaseRepository, makeConnection
} from "../../bots-core/Infrastructure/repository/bot-core-mongo-database.repository";
import {MongooseProvider} from "../../bots-core/Infrastructure/repository/database-providers/mongoose.provider";
import {IProcessor} from "../../bots-core/Infrastructure/processor";
import {GetChatIdProcessor} from "./Bot/message-processors/send-chatid.processor";
import {StartProcessor} from "./Bot/message-processors/start.processor";
import {CatchAllProcessor} from "./Bot/message-processors/catch-all.processor";

process.on('unhandledRejection', function (reason, p) {
    console.error('ERROR')
    console.error(reason, p)
})

const app = express();
app.use(express.json());

const botCoreConnectionString = SECURITY_CONSTANTS.bot_core_mongo_db_url;

export const botApiRepository = new BotCoreMongoDatabaseRepository(new MongooseProvider(mongoose), makeConnection, botCoreConnectionString)
export const botAPI = new BotAPI(SECURITY_CONSTANTS.token, botApiRepository, SECURITY_CONSTANTS.secretToken)
export const logger = new ConsoleLogger({
    serviceName: 'IT-INCUBATOR-BOT',
});

export const processors: IProcessor[] = [
    new StartProcessor(),
    // should be last processor
    new CatchAllProcessor(),
]

export const groupProcessors: IProcessor[] = [
    new GetChatIdProcessor(),
]

export const bot = new Bot(botAPI, processors, groupProcessors, botApiRepository, logger);

app.use("/api", rootRouter)


const start = async () => {
    const webhookUrl = `${SECURITY_CONSTANTS.appURL}/api/webhook/${SECURITY_CONSTANTS.token}`;
    await botAPI.createWebHook(webhookUrl);
    await bot.initialization();
    app.listen(SECURITY_CONSTANTS.port);
}

start()
