// app/api/text-to-speech/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import axios from 'axios';

// Initialize the client with Google Cloud credentials
// In production, use environment variables or other secure methods to store credentials
const client = new TextToSpeechClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

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
        const endPoint = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${apikey}`;
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

        // // Configure request
        // const request = {
        //     input: { text },
        //     voice: { languageCode: 'en-US', ssmlGender: 'MALE' as const },
        //     audioConfig: { audioEncoding: 'MP3' as const },
        // };

        // // Perform the text-to-speech request
        // const [response] = await client.synthesizeSpeech(request);


        // // The response's audioContent is base64-encoded
        // const audioContent = Buffer.from(response.audioContent as Uint8Array).toString('base64');

        // return NextResponse.json({ audioContent });
    } catch (error) {
        console.error('Error in text-to-speech API route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}











