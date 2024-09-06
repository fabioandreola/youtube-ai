import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db: any;

async function openDb() {
  if (!db) {
    db = await open({
      filename: './transcriptions.sqlite',
      driver: sqlite3.Database
    });
    await db.exec(`
      CREATE TABLE IF NOT EXISTS transcriptions (
        url TEXT PRIMARY KEY,
        transcription TEXT,
        segments TEXT,
        words TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  return db;
}

export async function getTranscription(url: string) {
  const db = await openDb();
  const result = await db.get('SELECT * FROM transcriptions WHERE url = ?', [url]);
  if (result) {
    return {
      transcription: result.transcription,
      segments: JSON.parse(result.segments),
      words: JSON.parse(result.words)
    };
  }
  return null;
}

export async function saveTranscription(url: string, transcription: string, segments: any[], words: any[]) {
  const db = await openDb();
  await db.run(
    'INSERT OR REPLACE INTO transcriptions (url, transcription, segments, words) VALUES (?, ?, ?, ?)',
    [url, transcription, JSON.stringify(segments), JSON.stringify(words)]
  );
}
