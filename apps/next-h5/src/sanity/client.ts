import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (typeof window === 'undefined') {
    console.log("BUILD INFO: Next.js build-time environment variables check:");
    console.log(`- NEXT_PUBLIC_SANITY_PROJECT_ID: ${projectId ? 'PRESENT' : 'MISSING'}`);
    console.log(`- NEXT_PUBLIC_SANITY_DATASET: ${dataset ? 'PRESENT' : 'MISSING'}`);
}

export const client = createClient({
    projectId: projectId || "gi77yzcp",
    dataset: dataset || "production",
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
    useCdn: false,
});
