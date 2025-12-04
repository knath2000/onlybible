import { NextResponse } from 'next/server';

export async function GET(request: Request): Promise<NextResponse> {
  const apiKey = process.env.BIBLIA_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { 
        success: false,
        error: 'API key not configured. Please set BIBLIA_API_KEY in .env.local',
        envKey: process.env.BIBLIA_API_KEY || 'NOT_SET'
      },
      { status: 500 }
    );
  }

  try {
    // Test with a simple API call to check if the key works
    const testUrl = `https://api.biblia.com/v1/bible/find?query=reina-valera&key=${apiKey}`;
    
    const response = await fetch(testUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      apiKey: apiKey.substring(0, 8) + '...', // Don't expose full key
      testUrl: testUrl,
      responseStatus: response.status,
      responseData: data,
      message: 'API key is working'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'API key test failed'
    }, { status: 500 });
  }
}