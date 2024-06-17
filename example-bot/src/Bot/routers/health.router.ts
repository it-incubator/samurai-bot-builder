import {Request, Response, Router} from 'express'


const healthRouter = Router();

healthRouter
    .get(`/`, (req: Request, res: Response) => {
        res.json({
            status: "ok",
        });
    })

export default healthRouter;
