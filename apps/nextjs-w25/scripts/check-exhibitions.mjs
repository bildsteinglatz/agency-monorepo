import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  projectId: 'yh2vvooq',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function run() {
  try {
    const query = `*[_type == "exhibition"] | order(year desc) [0...5] {
      title,
      year,
      venue
    }`;
    const exhibitions = await client.fetch(query);
    console.log(JSON.stringify(exhibitions, null, 2));
  } catch (error) {
    console.error(error);
  }
}

run();');
    console.log('Exhibitions:', JSON.stringify(exhibitions, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
