import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'nodejs';

// Image metadata
export const alt = 'Halle 5 | Ateliers & Werkstätten';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
          fontWeight: 900,
          border: '20px solid #fdc800',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Brutalist background elements */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          background: '#fdc800',
          transform: 'rotate(15deg)',
          opacity: 0.8,
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-50px',
          left: '20%',
          width: '300px',
          height: '100px',
          background: '#facc15', // Signature yellow
          transform: 'rotate(-5deg)',
          display: 'flex',
        }} />

        <div style={{ 
          color: 'white', 
          marginBottom: '-20px', 
          letterSpacing: '-0.05em', 
          zIndex: 10,
          display: 'flex',
        }}>
          HALLE 5
        </div>
        <div style={{ 
          color: '#fdc800', 
          fontSize: 48, 
          marginTop: '20px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          zIndex: 10,
          background: 'black',
          padding: '5px 10px',
          display: 'flex',
        }}>
          Ateliers & Werkstätten
        </div>
        <div style={{ 
          position: 'absolute',
          bottom: '40px',
          right: '40px',
          background: '#fdc800',
          color: 'black',
          padding: '10px 20px',
          fontSize: 24,
          fontWeight: 'bold',
          textTransform: 'uppercase',
          zIndex: 10,
          display: 'flex',
        }}>
          Dornbirn, Campus V
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
