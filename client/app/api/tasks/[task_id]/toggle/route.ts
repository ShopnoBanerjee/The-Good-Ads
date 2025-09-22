import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ task_id: string }> }
) {
  try {
    // Await the params
    const { task_id } = await params;

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Forward the request to the FastAPI backend
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${task_id}/toggle`, {
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
    console.error('Task toggle API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
