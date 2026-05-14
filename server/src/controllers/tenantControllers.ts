import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { wktToGeoJSON } from "@terraformer/wkt";

export const getTenant = async (req: Request, res: Response): Promise<void> => {
    try {
        const cognitoId = req.params.cognitoId as string;
        const tenant = await prisma.tenant.findUnique({
            where: { cognitoId },
            include: {
                favorites: true
            }
        });

        if(tenant) {
            res.json(tenant);
        } else {
            res.status(404).json({ message: "Tenant not found" });
        }

    } catch (error: any) {
        res.status(500).json({ message: `Error retrieving tenant: ${error.message}` });
    }
};


export const createTenant = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body;
        const tenant = await prisma.tenant.create({
            data: {
                cognitoId: cognitoId as string,
                name: name as string,
                email: email as string,
                phoneNumber: phoneNumber as string,
            },
        });
        res.status(201).json(tenant);
    } catch (error: any) {
        res.status(500).json({ message: `Error creating tenant: ${error.message}` });
    }
};

export const updateTenant = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const cognitoId = req.params.cognitoId as string;
        const { name, email, phoneNumber } = req.body;
        const updateTenant = await prisma.tenant.update({
            where: { cognitoId },
            data: {
                name: name as string,
                email: email as string,
                phoneNumber: phoneNumber as string,
            },
        });
        res.json(updateTenant);
    } catch (error: any) {
        res.status(500).json({ message: `Error updating tenant: ${error.message}` });
    }
};



export const getCurrentResidence = async (req: Request, res: Response): Promise<void> => {
    try {

        const {cognitoId} = req.params as {cognitoId: string};

        const properties = await prisma.property.findMany({
            where: { tenants: { some: { cognitoId: cognitoId as string } } },
            include: { location: true },
        });

        const residencesWithFormattedLocations = await Promise.all(
            properties.map(async (property) => {
                const coordinates: { coordinates: string }[] = await prisma.$queryRaw`
                    SELECT ST_asText(coordinates) as coordinates
                    FROM "Location"
                    WHERE id = ${property.locationId}
                `;

                const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
                const longtitude = geoJSON?.coordinates?.[0] ?? 0;
                const latitude = geoJSON?.coordinates?.[1] ?? 0;

                const existingLocation = (property as any).location || {};

                return {
                    ...property,
                    location: {
                        ...existingLocation,
                        coordinates: {
                            longitude: longtitude,
                            latitude: latitude,
                        },
                    },
                };
            })
        );

        res.json(residencesWithFormattedLocations);
        
    } catch (error: any) {
        res.status(500).json({ message: `Error retrieving Current Residence: ${error.message}` });
    }
};

export const addFavoriteProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cognitoId, propertyId } = req.params as { cognitoId: string; propertyId: string };
        const tenant = await prisma.tenant.findUnique({
            where: { cognitoId: String(cognitoId) },
            include: { favorites: true }
        });

        if (!tenant) {
            res.status(404).json({ message: "Tenant not found" });
            return;
        }

        const propertyIdNumber = Number(propertyId);
        const existingFavourites = (tenant as any)?.favorites || [];

        if (!existingFavourites.some((fav: { id: number }) => fav.id === propertyIdNumber)) {
            const updatedTenant = await prisma.tenant.update({
                where: { cognitoId: String(cognitoId) },
                data: {
                    favorites: {
                        connect: { id: propertyIdNumber }
                    }
                },
                include: { favorites: true }
            });
            res.json(updatedTenant)
        } else {
            // Keep endpoint idempotent: already-favorited is a successful no-op
            res.json(tenant);
        }

    } catch (error: any) {
        res.status(500).json({ message: `Error adding favorite property: ${error.message}` });
    }
};


export const removeFavoriteProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cognitoId, propertyId } = req.params
        const propertyIdNumber = Number(propertyId);
        const updatedTenant = await prisma.tenant.update({
            where: { cognitoId: String(cognitoId) },
            data: {
                favorites: {
                    disconnect: { id: propertyIdNumber }
                }
            },
            include: { favorites: true }
        });
        res.json(updatedTenant);
    } catch (error: any) {
        res.status(500).json({ message: `Error removing favorite property: ${error.message}` });
    }
};

           