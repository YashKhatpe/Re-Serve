import { NextRequest, NextResponse } from 'next/server';
import { SpeechClient } from '@google-cloud/speech';
console.log("process.env:", process.env); // Add this line to inspect process.env

const client = new SpeechClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get('audio') as Blob;

        if (!audioFile) {
            return NextResponse.json(
                { error: "No audio file provided" },
                { status: 400 }
            );
        }

        const arrayBuffer = await audioFile.arrayBuffer();
        const audioBytes = Buffer.from(arrayBuffer);

        // Convert the audioBytes (which is now a WAV file) to base64


        const audio = {
            content: audioBytes.toString("base64"),
        };

        const config = {
            encoding: "LINEAR16" as const,
            // sampleRateHertz: 48000,
            languageCode: "en-US" as const,
            model: "phone_call"
        }


        const request = {
            audio,
            config
        }

        const [response] = await client.recognize(request);
        const transcript =
            response.results
                ?.map((result) => result.alternatives?.[0]?.transcript ?? "")
                ?.filter((text) => text.length > 0)
                ?.join(" ") || "No transcription available";
        console.log(response.results);
        return NextResponse.json({ transcript });
    }
    catch (error) {
        console.error('Error in speech-to-text API route:', error);
        return NextResponse.json({ error }, { status: 500 });
    }
}
