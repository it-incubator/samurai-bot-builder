import {Router} from "express";
import webhookRouter from "./webhook.router";
import healthRouter from "./health.router";


const rootRouter = Router();

rootRouter
    .use("/webhook", webhookRouter)
    .use("/health", healthRouter)

export default rootRouter;
