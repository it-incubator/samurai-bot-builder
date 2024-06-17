import {Request, Response, Router} from "express";
import {bot, logger} from "../../app";
import SECURITY_CONSTANTS from "../constants/security-constants";

const webhookRouter = Router();

webhookRouter
    .post(`/${SECURITY_CONSTANTS.token}`, (req: Request, res: Response) => {
        const secret_token = req.headers["x-telegram-bot-api-secret-token"] as string;
        if (secret_token === SECURITY_CONSTANTS.secretToken) {
            bot.handleMessageFromUser(req.body);
        } else {
            logger.addError("FAILED SECRET_TOKEN WEBHOOK", "Router", "webhook")
            logger.addError(secret_token, "Router", "webhook")
        }
        res.status(200).json();
    });

export default webhookRouter;
