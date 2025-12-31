import { client } from "@/sanity/client";
import VisitClient from "./VisitClient";

export const revalidate = 60; // Revalidate every minute

async function getVisitData() {
    const data = await client.fetch(`{
        "page": *[_id == "visitPage" || _type == "visitPage"][0]{ 
            ...,
            visitPanel {
                ...,
                images[] {
                    ...,
                    asset->
                }
            }
        },
        "global": *[_id == "halle5Info" || _type == "halle5Info"][0]{
            address,
            openingHours,
            contactEmail,
            googleMapsLink
        }
    }`);

    const p = data.page || {};
    const g = data.global || {};

    // Consolidate data on the server to avoid CORS issues and logic duplication
    return {
        // Primary identity and content from visitPage
        title: p.title || p.visitPanel?.title || 'Besuchen',
        address: p.address || g.address,
        openingHours: p.openingHours || g.openingHours,
        contactEmail: p.contactEmail || g.contactEmail,
        googleMapsLink: p.googleMapsLink || g.googleMapsLink,

        // Panel details
        visitPanel: p.visitPanel || {},

        // Keep raw page data for any other fields
        ...p
    };
}

export default async function VisitPage() {
    const initialData = await getVisitData();

    return <VisitClient initialData={initialData} />;
}
