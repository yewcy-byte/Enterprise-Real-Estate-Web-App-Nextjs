 import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { wktToGeoJSON } from "@terraformer/wkt";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";
import type { Location } from "@prisma/client";


const awsRegion = process.env.AWS_REGION;
const s3Client = awsRegion ? new S3Client({ region: awsRegion }) : new S3Client({});

export const getProperties = async (req: Request, res: Response): Promise<void> => {
    try {
     const {
        priceMin,
        priceMax,
        beds,
        baths,
        propertyType,
        squareFeetMin,
        squareFeetMax,
        amenities,
     } = req.query;

     const where: any = {};

     if(priceMin){
        where.pricePerMonth = { ...where.pricePerMonth, gte: Number(priceMin) };
     }

     if (priceMax){
        where.pricePerMonth = { ...where.pricePerMonth, lte: Number(priceMax) };
     }

     if (beds && beds !=="any"){
        where.beds = { gte: Number(beds) };
     }

     if (baths && baths !=="any"){
        where.baths = { gte: Number(baths) };
     }

     if (squareFeetMin){
        where.squareFeet = { ...where.squareFeet, gte: Number(squareFeetMin) };
     }

     if (squareFeetMax){
        where.squareFeet = { ...where.squareFeet, lte: Number(squareFeetMax) };
     }

     if (propertyType && propertyType !== "any"){
        where.propertyType = propertyType;
     }

     if (amenities && amenities !== "any"){
        const amenitiesArray = (amenities as string).split(",");
        where.amenities = { hasSome: amenitiesArray };
     }

     const properties = await prisma.property.findMany({
        where,
        include: { location: true }
     });

     // Query WKT coordinates separately since PostGIS isn't parsed properly
     const coordsMap = new Map();
     try {
        const wktCoords: any[] = await prisma.$queryRaw`
            SELECT l.id, ST_AsText(l.coordinates) as wkt 
            FROM "Location" l
        `;
        wktCoords.forEach((row: any) => {
            coordsMap.set(row.id, row.wkt);
        });
     } catch (err) {
        console.warn('Could not fetch WKT coordinates:', err);
     }

     // Convert PostGIS geography to JSON coordinates
     const propertiesWithCoords = properties.map((property: any) => {
        let coordinates = { latitude: 34.05, longitude: -118.25 }; // Default to LA
        
        const wkt = coordsMap.get(property.location?.id);
        if (wkt) {
            try {
                console.log(`[${property.name}] Raw WKT:`, wkt);
                
                const geoJSON: any = wktToGeoJSON(wkt);
                console.log(`[${property.name}] Parsed:`, geoJSON);
                
                if (geoJSON && Array.isArray(geoJSON.coordinates) && geoJSON.coordinates.length >= 2) {
                    coordinates = {
                        longitude: geoJSON.coordinates[0],
                        latitude: geoJSON.coordinates[1]
                    };
                    console.log(`[${property.name}] SUCCESS:`, coordinates);
                }
            } catch (err: any) {
                console.error(`[${property.name}] Parse error:`, err.message);
            }
        }
        
        return {
            ...property,
            location: {
                ...property.location,
                coordinates
            }
        };
     });

     res.json(propertiesWithCoords);

    } catch (error: any) {
        res.status(500).json({ message: `Error retrieving properties: ${error.message}` });
    }
};


export const getProperty = async (req: Request, res: Response): Promise<void> => {
    try {

        const {id} = req.params;
        const property = await prisma.property.findUnique({
            where: {id: Number(id)},
            include: {location: true}
        });
        if (property) {
            const coordinates : {coordinates: string}[] = 
            await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates FROM "Location" WHERE id = ${property.locationId}`;
            const geoJSON : any = wktToGeoJSON(coordinates[0]?.coordinates || "");
            const longtitude = geoJSON.coordinates[0];
            const latitude = geoJSON.coordinates[1];

            const propertyWithLocation = {
                ...property,
                location: {
                    ...property.location,
                    coordinates: {
                    longitude: longtitude,
                    latitude: latitude
                    }
                }
            };
            res.json(propertyWithLocation);
        }
    } catch (error: any) {
        res.status(500).json({ message: `Error retrieving Property: ${error.message}` });
    }
};


export const createProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = (req.files as Express.Multer.File[]) || [];
        const {
            address,
            city,
            state,
            country,
            postalCode,
            managerCognitoId,
            ...propertyData
        } = req.body;

                const photoUrls = await Promise.all(
                    files.map(async (file) => {
                        const uploadParams = {
                        Bucket: process.env.AWS_S3_BUCKET_NAME,
                        Key: `properties/${Date.now()}-${file.originalname}`,
                        Body: file.buffer,
                        ContentType: file.mimetype,
                    }
                const uploadResult = await new Upload({
                    client: s3Client,
                    params: uploadParams
                    }).done();
                        return uploadResult.Location;
         } )
                );

        // For now, keep photoUrls empty since S3 is not configured

        const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
            {
                street: address,
                city,
                country,
                postalcode: postalCode,
                format: "json",
                limit: "1"
            }
        ).toString()}`;
        const geocodingResponse = await axios.get(geocodingUrl, {
            headers: {
                "User-Agent": "RealEstateApp (justsomedude@gmail.com)"
            }
        });

        const [longtitude, latitude] =
            geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat
                ? [parseFloat(geocodingResponse.data[0]?.lon), parseFloat(geocodingResponse.data[0]?.lat)]
                : [0, 0];

        // create location
        const [location] = await prisma.$queryRaw<Location[]>`
            INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
            VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longtitude}, ${latitude}), 4326))
            RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates`;

        if (!location) {
            throw new Error("Failed to create location");
        }

        // create property
        const newProperty = await prisma.property.create({
            data: {
                ...propertyData,
                photoUrls,
                locationId: location.id,
                managerCognitoId,
                amenities: typeof propertyData.amenities === "string" ? propertyData.amenities.split(",") : [],

                highlights: typeof propertyData.highlights === "string" ? propertyData.highlights.split(",") : [],
                isPetsAllowed: propertyData.isPetsAllowed === "true",
                isParkingIncluded: propertyData.isParkingIncluded === "true",
                pricePerMonth: parseFloat(propertyData.pricePerMonth),
                securityDeposit: parseFloat(propertyData.securityDeposit),
                applicationFee: parseFloat(propertyData.applicationFee),
                beds: parseInt(propertyData.beds),
                baths: parseFloat(propertyData.baths),
                squareFeet: parseInt(propertyData.squareFeet)
            },

            include: {
                location: true,
                manager: true
            }
        });

        res.status(201).json(newProperty);
    } catch (error: any) {
        console.error('createProperty error:', error?.stack ?? error);
        res.status(500).json({ message: `Error creating Property: ${error.message}` });
    }
};

    


