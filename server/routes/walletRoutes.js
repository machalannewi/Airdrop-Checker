// routes/walletRoutes.js
import express from "express";
const router = express.Router();

router.get("/wallet-addresses", (req, res) => {
    res.json({
        btc: process.env.BTC_ADDRESS,
        eth: process.env.ETH_ADDRESS,
        sol: process.env.SOL_ADDRESS
    });
});

export default router;
