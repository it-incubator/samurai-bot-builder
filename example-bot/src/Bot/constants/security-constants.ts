const SECURITY_CONSTANTS = {
    env: process.env.ENV || 'DEVELOPMENT',
    port: Number(process.env.PORT || 3087),
    token: process.env.TELEGRAM_BOT_TOKEN ?? 'token',
    secretToken: process.env.SECRET_TOKEN ?? 'secret',
    bot_core_mongo_db_url: process.env.BOT_CORE_MONGO_DB_URL ?? 'mongodb://localhost:27017/example-bot',
    appURL: process.env.CURRENT_APP_URL ?? 'https://9ebb-178-123-233-50.ngrok-free.app',
    batchSize: +(process.env.BATCH_SIZE || 70),
    timeoutInSecondBatchSend: +(process.env.TIMEOUT_IN_SECOND_BATCH_SEND || 1),
};

export default SECURITY_CONSTANTS
