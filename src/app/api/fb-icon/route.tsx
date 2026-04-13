import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1024px',
          height: '1024px',
          backgroundColor: '#09090b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '700px',
          fontWeight: 'bold',
          color: '#10b981',
          fontFamily: 'sans-serif'
        }}
      >
        F
      </div>
    ),
    {
      width: 1024,
      height: 1024,
    }
  );
}
