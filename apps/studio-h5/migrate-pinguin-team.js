import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'gi77yzcp',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_SESSION_TOKEN // Sanity exec injects this
})

;(async () => {
  const pinguinId = (await client.fetch('*[_type == "pinguin"][0]._id'));

  const newTeam = [
    { _type: 'reference', _ref: 'e8cb4f50-3815-4a69-bbec-94ecc0601302', _key: 'bildstein' }, // Matthias Bildstein
    { _type: 'reference', _ref: '7f8b8a21-8369-441f-9b78-43d5b2434ceb', _key: 'lunardi' },   // Manuel Lunardi
    { _type: 'reference', _ref: '3d70eb0b-9c4f-4469-a907-89165cf558a6', _key: 'holzer' },    // Sandra Holzer
    { _type: 'reference', _ref: 'a4f268b9-2223-41d1-9381-6f9e07a497eb', _key: 'schlenker' }  // Stefan Schlenker
  ];

  const patch = client.patch(pinguinId).set({ team: newTeam });
  await patch.commit();
  console.log('Pinguin team updated successfully!');
})();
