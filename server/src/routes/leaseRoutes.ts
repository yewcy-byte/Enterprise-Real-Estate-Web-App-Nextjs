import express from "express";
import { getManager, createManager, updateManager, getManagerProperties } from "../controllers/managerControllers.js";
import { get } from "node:http";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getLeasePayments, getLeases } from "../controllers/leaseControllers.js";
    


const router = express.Router();

router.get("/", authMiddleware(["manager", "tenant"]), getLeases);
router.get("/payments/:id", authMiddleware(["manager", "tenant"]), getLeasePayments);

export default router;