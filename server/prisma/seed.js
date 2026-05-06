import "dotenv/config";
import fs from "fs";
import path from "path";
import { Pool } from "pg";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function toPascalCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function toCamelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}
async function insertLocationData(locations) {
    for (const location of locations) {
        const { id, country, city, state, address, postalCode, coordinates } = location;
        try {
            const sql = `INSERT INTO "Location" (id, country, city, state, address, "postalCode", coordinates) VALUES ($1,$2,$3,$4,$5,$6, ST_GeomFromText($7, 4326));`;
            await pool.query(sql, [id, country, city, state, address, postalCode, coordinates]);
            console.log(`Inserted location for ${city}`);
        }
        catch (error) {
            console.error(`Error inserting location for ${city}:`, error);
        }
    }
}
async function resetSequence(modelName) {
    const quotedModelName = `"${toPascalCase(modelName)}"`;
    try {
        await pool.query(`SELECT setval(pg_get_serial_sequence('${toPascalCase(modelName)}', 'id'), COALESCE(MAX(id)+1, 1), false) FROM ${quotedModelName};`);
        console.log(`Reset sequence for ${modelName}`);
    }
    catch (err) {
        console.error(`Error resetting sequence for ${modelName}:`, err);
    }
}
async function deleteAllData(orderedFileNames) {
    const modelNames = orderedFileNames.map((fileName) => {
        return toPascalCase(path.basename(fileName, path.extname(fileName)));
    });
    for (const modelName of modelNames.reverse()) {
        try {
            await pool.query(`DELETE FROM "${modelName}";`);
            console.log(`Cleared data from ${modelName}`);
        }
        catch (error) {
            console.error(`Error clearing data from ${modelName}:`, error);
        }
    }
}
async function insertGeneric(modelName, items) {
    for (const item of items) {
        const filteredItem = Object.fromEntries(Object.entries(item).filter(([, value]) => {
            return value === null || Array.isArray(value) || typeof value !== "object";
        }));
        const cols = Object.keys(filteredItem);
        const values = cols.map((_, i) => `$${i + 1}`).join(",");
        const params = cols.map((c) => filteredItem[c]);
        const quotedCols = cols.map((c) => `"${c}"`).join(",");
        const sql = `INSERT INTO "${modelName}" (${quotedCols}) VALUES (${values});`;
        try {
            await pool.query(sql, params);
        }
        catch (err) {
            console.error(`Error inserting into ${modelName}:`, err, { item });
        }
    }
}
async function main() {
    const dataDirectory = path.join(__dirname, "seedData");
    const orderedFileNames = [
        "location.json", // No dependencies
        "manager.json", // No dependencies
        "property.json", // Depends on location and manager
        "tenant.json", // No dependencies
        "lease.json", // Depends on property and tenant
        "application.json", // Depends on property and tenant
        "payment.json", // Depends on lease
    ];
    try {
        // Delete all existing data
        await deleteAllData(orderedFileNames);
        // Seed data
        for (const fileName of orderedFileNames) {
            const filePath = path.join(dataDirectory, fileName);
            const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            const modelName = toPascalCase(path.basename(fileName, path.extname(fileName)));
            if (modelName === "Location") {
                await insertLocationData(jsonData);
            }
            else {
                await insertGeneric(modelName, jsonData);
                console.log(`Seeded ${modelName} from ${fileName}`);
            }
            // Reset the sequence after seeding each model
            await resetSequence(modelName);
            await sleep(250);
        }
        console.log("Seeding complete");
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await pool.end();
    }
}
main();
//# sourceMappingURL=seed.js.map