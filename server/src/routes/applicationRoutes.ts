import express from "express";
import { getManager, createManager, updateManager, getManagerProperties } from "../controllers/managerControllers.js";
import { get } from "node:http";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getLeasePayments, getLeases } from "../controllers/leaseControllers.js";
import { createApplication, ListApplications, updateApplicationStatus } from "../controllers/applicationControllers.js";
    


const router = express.Router();

router.post("/", authMiddleware(["tenant"]), createApplication);
router.put("/:id/status", authMiddleware(["manager"]), updateApplicationStatus);
router.get("/", authMiddleware(["tenant", "manager"]), ListApplications);


export default router;