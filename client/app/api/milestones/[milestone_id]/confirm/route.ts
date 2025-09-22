import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ milestone_id: string }> }
) {
  try {
    // Await the params
    const { milestone_id } = await params;
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Forward the request to the FastAPI backend
    const backendResponse = await fetch(`http://localhost:8000/api/milestones/${milestone_id}/confirm`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
      },
    });

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(responseData, { status: backendResponse.status });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Milestone confirm API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
