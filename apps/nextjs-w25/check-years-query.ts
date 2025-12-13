import { client } from './src/sanity/client';

async function checkYearsQuery() {
  try {
    const result = await client.fetch(`{
      "years": array::unique(*[_type == "artwork" && showOnWebsite == true && defined(year)].year) | order(@ desc)
    }`);
    console.log('Years:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkYearsQuery();
