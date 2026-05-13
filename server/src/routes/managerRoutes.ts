import express from "express";
import { getManager, createManager, updateManager, getManagerProperties } from "../controllers/managerControllers.js";
import { get } from "node:http";



const router = express.Router();

router.get("/:cognitoId", getManager);
router.post("/", createManager);
router.put("/:cognitoId", updateManager);
router.get("/:cognitoId/properties", getManagerProperties)

export default router;