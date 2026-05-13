 import type { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";
import type { Location } from "@prisma/client";


const prisma = new PrismaClient();

const awsRegion = process.env.AWS_REGION;
const s3Client = awsRegion ? new S3Client({ region: awsRegion }) : new S3Client({});

export const getProperties = async (req: Request, res: Response): Promise<void> => {
    try {
     const {
        favouriteIds,
        priceMin,
        priceMax,
        beds,
        baths,
        propertyType,
        squareFeetMin,
        squareFeetMax,
        amenities,
        availableFrom,
        latitude,
        longitude
     } = req.query;

     let whereConditions : Prisma.Sql[] = [];

     if (favouriteIds) {
        const favouriteIdsArray = (favouriteIds as string).split(",").map(Number);
        whereConditions.push(Prisma.sql`id IN (${Prisma.join(favouriteIdsArray)})`);
     }

     if(priceMin){
        whereConditions.push(
            Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`
        )
     }

     if (priceMax){
        whereConditions.push(
            Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`
        )
     }

       if (beds && beds !=="any"){
        whereConditions.push(
            Prisma.sql`p."beds" >= ${Number(beds)}`
        )
     }

         if (baths && baths !=="any"){
        whereConditions.push(
            Prisma.sql`p."baths" >= ${Number(baths)}`
        )
     }

     if (squareFeetMax){
        whereConditions.push(
            Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`
        )
     }

     if (squareFeetMin){
        whereConditions.push(
            Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`
        )
     }

     if (propertyType && propertyType !== "any"){
        whereConditions.push(
            Prisma.sql`p."propertyType" = ${propertyType}::"PropertyType"`
        )
     }

          if (amenities && amenities !== "any"){
            const amenitiesArray = (amenities as string).split(",");
        whereConditions.push(
            Prisma.sql`p."amenities" @> ${Prisma.join(amenitiesArray, ",")}::"Amenity"[]`
        )
     }

     if (availableFrom && availableFrom !== "any"){
        const availableFromDate = typeof availableFrom === "string"? availableFrom: null;
        if (availableFromDate){
            const date = new Date(availableFromDate)
        if (!isNaN(date.getTime()))
        whereConditions.push(
            Prisma.sql`EXISTS(
                SELECT : FROM "Lease" l
                WHERE l."propertyId" = p.id
                AND l."startDate" <= ${date.toISOString()}
            )`
        )
        }
     }

     if (latitude && longitude){
        const lat = parseFloat(latitude as string)
        const lng = parseFloat(longitude as string)
        const radiusInKilometers = 1000
        const degrees = radiusInKilometers / 111

        whereConditions.push(
            Prisma.sql`ST_DWithin(
                l.coodinates :: geometry,
                ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
                ${degrees}
            )`
        )
     }

     const completeQuery = Prisma.sql`
     SELECT p.*,
     json_build_object(
        'id', l.id,
        "address", l.address,
        "city", l.city,
        "state", l.state,
        "country", l.country,
        "postalCode", l.postalCode,
        "coordinates", json_build_object(
            'latitude', ST_Y(l.coordinates::geometry),
            'longitude', ST_X(l.coordinates::geometry)
        )

      ) as location
     FROM "Property" p
     JOIN "Location" l ON p."locationId" = l.id
     ${
        whereConditions.length > 0
        ? Prisma.sql `WHERE ${Prisma.join(whereConditions, " AND ")}`
        : Prisma.empty
     }`
        const properties = await prisma.$queryRaw(completeQuery);


    } catch (error: any) {
        res.status(500).json({ message: `Error retrieving Manager: ${error.message}` });
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
            const files = req.files as Express.Multer.File[];
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
      

            const geocodingUrl= `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
                {
                    street: address,
                    city,
                    country,
                    postalcode: postalCode,
                    format: "json",
                    limit: "1"
    }).toString()}`;
    const geocodingResponse = await axios.get(geocodingUrl, {
        headers:{
            "User-Agent" : "RealEstateApp (justsomedude@gmail.com)"
        }
    })

    const [longtitude, latitude] = geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat ?[
        parseFloat(geocodingResponse.data[0]?.lon),
        parseFloat(geocodingResponse.data[0]?.lat)
    ] : [0, 0];


    //create location
    const [location] = await prisma.$queryRaw<Location[]>`
    INSERT INTO "Location" (address, city, state, country, postalCode, coordinates)
    VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longtitude}, ${latitude}), 4326))
    RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates`;

    if (!location) {
        throw new Error("Failed to create location");
    }

//create property
const newProperty = await prisma.property.create({
    data:{
        ...propertyData,
        photoUrls,
        locationId: location.id,
        managerCognitoId,
        amenities:
        typeof propertyData.amenities === "string"
        ? propertyData.amenities.split(",") : [],

        highlights:
        typeof propertyData.highlights === "string"? propertyData.highlights.split(",") : [],
        isPetsAllowed: propertyData.isPetsAllowed === "true",
        isParkingInclude: propertyData.isParkingIncluded === "true",
        pricePerMonth: parseFloat (propertyData.pricePerMonth),
        securityDeposit: parseFloat(propertyData.securityDeposit),
        applicationFee: parseFloat(propertyData.applicationFee),
        beds: parseInt(propertyData.beds),
        baths: parseInt(propertyData.baths),
        squareFeet: parseInt(propertyData.squareFeet),  

    },

    include:{
        location : true,
        manager: true
    }

})
    } catch (error: any) {
        res.status(500).json({ message: `Error creating Property: ${error.message}` });
    }
};

    


