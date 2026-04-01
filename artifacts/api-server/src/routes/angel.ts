import { Router, type IRouter } from "express";
import { syncPrices } from "../angel/priceSync";
import { login } from "../angel/client";

const router: IRouter = Router();

router.get("/angel/status", async (req, res) => {
  try {
    const sess = await login();
    res.json({
      connected: true,
      message: "Angel One connected successfully",
      tokenPreview: sess.jwtToken.slice(0, 20) + "...",
    });
  } catch (err) {
    res.status(503).json({
      connected: false,
      message: err instanceof Error ? err.message : "Connection failed",
    });
  }
});

router.post("/angel/sync", async (req, res) => {
  try {
    const result = await syncPrices(true);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Sync failed" });
  }
});

export default router;
