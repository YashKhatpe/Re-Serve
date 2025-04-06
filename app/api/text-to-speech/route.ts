// app/api/text-to-speech/route.ts
import { NextRequest, NextResponse } from 'next/server';
// import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import axios from 'axios';

// Initialize the client with Google Cloud credentials
// In production, use environment variables or other secure methods to store credentials
// const client = new TextToSpeechClient({
//     keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
// });

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text } = body;

        if (!text) {
            return NextResponse.json(
                { error: 'Missing required field: text' },
                { status: 400 }
            );
        }
        const apikey = process.env.API_KEY;
        const endPoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apikey}`;
        const payload = {
            "audioConfig": {
                "audioEncoding": "MP3",
                "effectsProfileId": [
                    "small-bluetooth-speaker-class-device"
                ],
                "pitch": 0,
                "speakingRate": 1
            },
            "input": {
                "text": text
            },
            "voice": {
                "languageCode": "en-US",
                "name": "en-US-Chirp3-HD-Aoede"
            }
        }

        const response = await axios.post(endPoint, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return NextResponse.json(response.data);


    } catch (error) {
        console.error('Error in text-to-speech API route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}











