import { NextResponse } from 'next/server';
import { Downloader } from 'ytdl-mp3';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import crypto from 'crypto';
import { getTranscription, saveTranscription } from '@/lib/db';
import { promisify } from 'util';
import { exec } from 'child_process';

promisify(exec);

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function transcribeAudio(filePath: string): Promise<OpenAI.Audio.Transcription> {
  // Convert the audio to a lower quality MP3
  const outputPath = filePath.replace('.mp3', '_lowquality.mp3');
  await convertAudio(filePath, outputPath);

  const file = fs.createReadStream(outputPath);
  const transcription = await openai.audio.transcriptions.create({
    file: file,
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["segment", "word"],
  });

  // Clean up the temporary low-quality file
  fs.unlinkSync(outputPath);

  return transcription;
}

async function convertAudio(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setFfmpegPath(ffmpegInstaller.path)
      .outputOptions(['-ac 1', '-ar 16000', '-b:a 32k'])
      .output(outputPath)
      .on('end', () => {
        console.log('Audio conversion finished');
        resolve();
      })
      .on('error', (err: Error) => {
        console.error('Error during audio conversion:', err);
        reject(err);
      })
      .run();
  });
}

function clearTempFolder(outputDir: string) {
  const files = fs.readdirSync(outputDir);
  for (const file of files) {
    if (file.endsWith('.mp3')) {
      fs.unlinkSync(path.join(outputDir, file));
      console.log(`Deleted previous file: ${file}`);
    }
  }
}

function generateUniqueFileName(): string {
  return `${crypto.randomUUID()}.mp3`;
}

function findDownloadedFile(outputDir: string): string | null {
  const files = fs.readdirSync(outputDir);
  const mp3File = files.find(file => file.endsWith('.mp3'));
  return mp3File ? path.join(outputDir, mp3File) : null;
}

export async function POST(req: Request) {
  console.log('Received POST request');
  const { youtubeUrl } = await req.json();
  console.log('YouTube URL:', youtubeUrl);

  try {
    // Check if transcription exists in database
    const existingTranscription = await getTranscription(youtubeUrl);
    if (existingTranscription) {
      console.log('Found existing transcription in database');
      return NextResponse.json(existingTranscription);
    }

    const outputDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Clear previous MP3 files
    clearTempFolder(outputDir);

    console.log('Downloading audio from YouTube');
    const downloader = new Downloader({
      getTags: false,
      outputDir: outputDir,
    });
    await downloader.downloadSong(youtubeUrl);
    console.log('YouTube download complete');

    // Find the downloaded file
    const downloadedFilePath = findDownloadedFile(outputDir);
    if (!downloadedFilePath) {
      console.error('Downloaded file not found');
      throw new Error('Downloaded file not found');
    }
    console.log('Found downloaded file:', downloadedFilePath);

    // Rename the file to a unique name
    const uniqueFileName = generateUniqueFileName();
    const uniqueOutputPath = path.join(outputDir, uniqueFileName);
    fs.renameSync(downloadedFilePath, uniqueOutputPath);
    console.log('Audio file renamed:', uniqueOutputPath);

    console.log('Transcribing audio');
    const transcription = await transcribeAudio(uniqueOutputPath);

    console.log('Transcription complete');

    // Clean up
    fs.unlinkSync(uniqueOutputPath);
    console.log('Temporary file deleted');

    // Save transcription to database
    await saveTranscription(
      youtubeUrl, 
      (transcription as any).text, 
      (transcription as any).segments, 
      (transcription as any).words
    );

    return NextResponse.json({ 
      transcription: (transcription as any).text,
      segments: (transcription as any).segments,
      words: (transcription as any).words
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to transcribe video' }, { status: 500 });
  }
}
