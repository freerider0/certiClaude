import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const deductCreditsSchema = z.object({
  amount: z.number().min(1).max(100),
  description: z.string().min(1).max(200),
  certificateId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    // Get the current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's agency
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single();

    if (!profile?.agency_id) {
      return NextResponse.json(
        { error: 'No agency found' },
        { status: 400 }
      );
    }

    // Validate request body
    const body = await request.json();
    const { amount, description, certificateId } = deductCreditsSchema.parse(body);

    // Deduct credits using the database function
    const { data: success } = await supabase.rpc('deduct_credits', {
      p_agency_id: profile.agency_id,
      p_amount: amount,
      p_description: description,
      p_certificate_id: certificateId || null,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      );
    }

    // Get updated balance
    const { data: agency } = await supabase
      .from('agencies')
      .select('credits_balance')
      .eq('id', profile.agency_id)
      .single();

    return NextResponse.json({
      success: true,
      newBalance: agency?.credits_balance || 0,
    });

  } catch (error) {
    console.error('Credit deduction error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to deduct credits' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get the current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's agency and credit balance
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        agency_id,
        agencies!inner (
          credits_balance,
          credits_included,
          subscription_tier,
          subscription_status
        )
      `)
      .eq('id', user.id)
      .single();

    if (!profile?.agency_id) {
      return NextResponse.json(
        { error: 'No agency found' },
        { status: 400 }
      );
    }

    const agency = profile.agencies as any;

    return NextResponse.json({
      balance: agency.credits_balance || 0,
      included: agency.credits_included || 0,
      tier: agency.subscription_tier,
      status: agency.subscription_status,
    });

  } catch (error) {
    console.error('Get credits error:', error);
    return NextResponse.json(
      { error: 'Failed to get credit balance' },
      { status: 500 }
    );
  }
}