import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getManager = async (req: Request, res: Response): Promise<void> => {
    try {
        const cognitoId = req.params.cognitoId as string;
        const manager = await prisma.manager.findUnique({
            where: { cognitoId }
        });

        if(manager) {
            res.json(manager);
        } else {
            res.status(404).json({ message: "Manager not found" });
        }

    } catch (error: any) {
        res.status(500).json({ message: `Error retrieving Manager: ${error.message}` });
    }
};

export const createManager = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body as {
            cognitoId: string;
            name: string;
            email: string;
            phoneNumber: string;
        };
        const manager = await prisma.manager.create({
            data: {
                cognitoId,
                name,
                email,
                phoneNumber,
            },
        });
        res.status(201).json(manager);
    } catch (error: any) {
        res.status(500).json({ message: `Error creating Manager: ${error.message}` });
    }
};


export const updateManager = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const cognitoId = req.params.cognitoId as string;
        const { name, email, phoneNumber } = req.body;
        const updateManager = await prisma.manager.update({
            where: { cognitoId },
            data: {
                name: name as string,
                email: email as string,
                phoneNumber: phoneNumber as string,
            },
        });
        res.json(updateManager);
    } catch (error: any) {
        res.status(500).json({ message: `Error updating manager: ${error.message}` });
    }
};