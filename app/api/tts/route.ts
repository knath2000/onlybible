import { NextRequest, NextResponse } from 'next/server';

const TTS_PROVIDER = process.env.TTS_PROVIDER || 'azure';
const TTS_API_KEY = process.env.TTS_API_KEY || '';
const TTS_REGION = process.env.TTS_REGION || '';
const TTS_VOICE = process.env.TTS_VOICE || 'es-ES-AlvaroNeural';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || '';
  const lang = searchParams.get('lang') || 'es-ES';
  const voice = searchParams.get('voice') || TTS_VOICE;

  if (!text.trim()) {
    return NextResponse.json({ error: 'Missing text' }, { status: 400 });
  }

  if (text.length > 500) {
    return NextResponse.json({ error: 'Text too long (limit 500 chars)' }, { status: 400 });
  }

  if (TTS_PROVIDER !== 'azure') {
    return NextResponse.json({ error: 'Unsupported TTS provider', provider: TTS_PROVIDER }, { status: 500 });
  }

  if (!TTS_API_KEY || !TTS_REGION) {
    return NextResponse.json(
      { error: 'TTS is not configured. Set TTS_API_KEY and TTS_REGION.' },
      { status: 500 }
    );
  }

  try {
    const ssml = `<speak version='1.0' xml:lang='${lang}'><voice xml:lang='${lang}' name='${voice}'>${text}</voice></speak>`;
    const ttsUrl = `https://${TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': TTS_API_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'OnlyBibleApp/1.0'
      },
      body: ssml,
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'TTS provider error', status: response.status, details: errorText },
        { status: 502 }
      );
    }

    const audioArrayBuffer = await response.arrayBuffer();
    return new NextResponse(audioArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch TTS audio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

