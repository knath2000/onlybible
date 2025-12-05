import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word');
  
  if (!word) {
    return NextResponse.json({ error: 'Word is required' }, { status: 400 });
  }
  
  try {
    // Use MyMemory API (free, no key required for moderate usage)
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=es|en`
    );
    
    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract best translation
    // MyMemory returns { responseData: { translatedText: "..." }, matches: [...] }
    const translation = data.responseData?.translatedText;
    
    if (!translation) {
       return NextResponse.json({ error: 'No translation found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      translation,
      source: 'MyMemory'
    });
    
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json({ error: 'Failed to translate word' }, { status: 500 });
  }
}

