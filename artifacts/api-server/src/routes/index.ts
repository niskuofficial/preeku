import { Router, type IRouter } from "express";
import healthRouter from "./health";
import walletRouter from "./wallet";
import stocksRouter from "./stocks";
import watchlistRouter from "./watchlist";
import ordersRouter from "./orders";
import portfolioRouter from "./portfolio";

const router: IRouter = Router();

router.use(healthRouter);
router.use(walletRouter);
router.use(stocksRouter);
router.use(watchlistRouter);
router.use(ordersRouter);
router.use(portfolioRouter);

export default router;
