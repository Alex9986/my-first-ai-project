import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  // Check if the request has a valid JSON body
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return new NextResponse('Invalid content type', { status: 400 });
  }

  try {
    // Parse the JSON body
    const requestBody = await request.json();
    const { query } = requestBody;

    if (!query || typeof query !== 'string') {
      return new NextResponse('Missing or invalid query', { status: 400 });
    }

    // Make OpenAI API call with new SDK
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [ 
        // { role: "system", content: "You are a powerful assistant that translate English to French."},
        { role: "user", content: query },
      ],
      temperature: 1,
      max_tokens: 300,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || 'No response from AI';

    return NextResponse.json({ 
      response: aiResponse
    });

  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    // Handle specific errors
    if (error.status === 401) {
      return new NextResponse('Invalid API key', { status: 401 });
    }
    
    if (error.status === 429) {
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }
    
    return new NextResponse(
      error.message || 'Internal server error', 
      { status: 500 }
    );
  }
}

// Optional: Add GET method to test the endpoint
export async function GET() {
  return NextResponse.json({ 
    message: 'Chat API is running',
    instructions: 'Send a POST request with { "query": "your question" }'
  });
}