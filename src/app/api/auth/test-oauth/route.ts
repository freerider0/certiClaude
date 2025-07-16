import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test if we can create an OAuth URL directly with Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/api/auth/callback'
      }
    });

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        details: error
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      oauth_url: data.url,
      provider: data.provider
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      stack: error.stack
    }, { status: 500 });
  }
}