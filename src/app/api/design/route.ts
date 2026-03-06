import { NextRequest } from 'next/server';
import { Coordinator } from '@/lib/agents/coordinator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.userPrompt) {
      return Response.json(
        { error: 'userPrompt is required' },
        { status: 400 }
      );
    }

    const coordinator = new Coordinator();
    
    // Execute the full multi-agent workflow
    const result = await coordinator.executeWorkflow({
      userPrompt: body.userPrompt,
      region: body.region || 'US',
      inspirationImages: body.inspirationImages || [],
      floorPlan: body.floorPlan,
      userLocation: body.userLocation || 'US'
    });

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return Response.json(result.data);
  } catch (error) {
    console.error('Design workflow error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}