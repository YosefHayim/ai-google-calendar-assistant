/**
 * Type Generation Script
 * 
 * Fetches the OpenAPI schema from the backend and generates TypeScript types
 * using openapi-typescript.
 * 
 * Usage: npx tsx scripts/generate-types.ts
 * Or: npm run generate:types
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import openapiTS from "openapi-typescript";

const BACKEND_URL = process.env.BACKEND_API_BASE_URL || "http://localhost:3001";
const OPENAPI_SCHEMA_URL = `${BACKEND_URL}/api-docs.json`;
const OUTPUT_PATH = join(process.cwd(), "types", "api", "index.ts");

async function generateTypes(): Promise<void> {
  try {
    console.log(`Fetching OpenAPI schema from ${OPENAPI_SCHEMA_URL}...`);

    // Fetch the OpenAPI schema
    const response = await fetch(OPENAPI_SCHEMA_URL);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch OpenAPI schema: ${response.status} ${response.statusText}\n` +
          `Make sure the backend server is running at ${BACKEND_URL}`
      );
    }

    const schema = await response.json();

    console.log("Generating TypeScript types...");

    // Generate TypeScript types from the OpenAPI schema
    const types = await openapiTS(schema, {
      transform: (schemaObject, metadata) => {
        // Custom transformation if needed
        return schemaObject;
      },
    });

    // Add header comment
    const headerComment = `/**
 * Generated API types from OpenAPI schema
 * 
 * This file is auto-generated. DO NOT EDIT MANUALLY.
 * 
 * To regenerate types:
 *   npm run generate:types
 * 
 * Source: ${OPENAPI_SCHEMA_URL}
 * Generated at: ${new Date().toISOString()}
 */

`;

    const output = headerComment + types;

    // Write the generated types to file
    writeFileSync(OUTPUT_PATH, output, "utf-8");

    console.log(`✅ Types generated successfully at ${OUTPUT_PATH}`);
  } catch (error) {
    console.error("❌ Error generating types:", error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Run the script
generateTypes();
