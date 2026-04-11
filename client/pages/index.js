import Head from 'next/head';
import styles from '../styles/globals.css';

export default function Home() {
  return (
    <>
      <Head>
        <title>JukeBox London</title>
        <meta name="description" content="The Sound of Now — Powered by Lyria 3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="glass glass--elevated glow--gold" style={{ padding: '48px 64px', textAlign: 'center', maxWidth: '600px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 700, marginBottom: '16px' }}>
            JukeBox London
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '18px' }}>
            The Sound of Now — Powered by Lyria 3
          </p>
        </div>
      </main>
    </>
  );
}
