import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  projectId: 'yh2vvooq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, 
});

async function run() {
  // Fetch all text documents, excluding drafts
  const query = `*[_type == "textDocument" && !(_id in path("drafts.**"))] {
    _id,
    title,
    "slug": slug.current,
    "hasOriginalPdf": defined(originalPdf),
    "originalPdfAsset": originalPdf.asset._ref,
    "hasPdf": defined(pdf),
    "pdfAsset": pdf.asset._ref
  }`;
  
  const docs = await client.fetch(query);
  
  console.log(`Found ${docs.length} text documents.`);
  
  // Group by title
  const byTitle = {};
  docs.forEach(doc => {
    if (!byTitle[doc.title]) byTitle[doc.title] = [];
    byTitle[doc.title].push(doc);
  });

  Object.keys(byTitle).forEach(title => {
    console.log(`\nTitle: "${title}"`);
    byTitle[title].forEach(doc => {
      console.log(`  - ID: ${doc._id}`);
      console.log(`    Slug: ${doc.slug}`);
      console.log(`    Has originalPdf: ${doc.hasOriginalPdf}`);
      console.log(`    Has pdf: ${doc.hasPdf}`);
    });
  });
}

run();
