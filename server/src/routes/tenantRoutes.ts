import express from "express";
import { getTenant, createTenant, updateTenant, getCurrentResidence, addFavoriteProperty, removeFavoriteProperty } from "../controllers/tenantControllers.js";



const router = express.Router();

router.get("/:cognitoId", getTenant);
router.get("/:cognitoId/current-residences", getCurrentResidence);
router.post("/", createTenant);

router.put ("/:cognitoId", updateTenant);

router.post("/:cognitoId/favorites/:propertyId", addFavoriteProperty);
router.delete("/:cognitoId/favorites/:propertyId", removeFavoriteProperty);

export default router;