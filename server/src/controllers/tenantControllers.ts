import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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