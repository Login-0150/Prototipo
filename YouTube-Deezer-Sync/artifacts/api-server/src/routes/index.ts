import { Router, type IRouter } from "express";
import healthRouter from "./health";
import searchRouter from "./search";
import roomsRouter from "./rooms";
import spotifyRouter from "./spotify";

const router: IRouter = Router();

router.use(healthRouter);
router.use(searchRouter);
router.use(roomsRouter);
router.use("/auth/spotify", spotifyRouter);

export default router;
