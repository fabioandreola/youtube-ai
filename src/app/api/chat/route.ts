import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { transcription, message, conversation } = await req.json();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",  
      messages: [
        { role: "system", content: "You are a helpful assistant that can answer questions about the youtube video that was transcribed. " + 
            "You only provide answers about the youtube video. If you cannot find what the user asked in the video, please say so. "+ 
            "Use only the source transcription text to reply questions from the user. The text passed is always a transcription of a youtube video." +  
            "Your reply should be formatted for a chat window that supports markdown.:\n\n" + transcription },
        { role: "user", content: conversation + "\n\nUser: " + message }
      ],
      max_tokens: 500,  // Adjust as needed
      temperature: 0.7,  // Adjust for desired creativity/randomness
    });

    const response = completion.choices[0].message.content;

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 });
  }
}
