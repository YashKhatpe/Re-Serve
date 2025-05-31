import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob;

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
    // console.log(audio);

    const apikey = process.env.API_KEY;
    const endPoint = `https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${apikey}`;

    const config = {
      audio: {
        content: audio.content,
      },
      config: {
        enableAutomaticPunctuation: true,
        encoding: "LINEAR16",
        languageCode: "en-US",
        model: "default",
      },
    };

    const response = await axios.post(endPoint, config, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // const [response] = await client.recognize(request);
    console.log("rss: ", response.data);
    const transcript =
      response.data.results
        ?.map((result: any) => result.alternatives?.[0]?.transcript ?? "")
        ?.filter((text: any) => text.length > 0)
        ?.join(" ") || "No transcription available";
    return NextResponse.json({ transcript });
    // return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error in speech-to-text API route:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
