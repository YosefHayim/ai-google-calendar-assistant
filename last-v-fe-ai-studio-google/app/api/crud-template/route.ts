import { NextResponse } from 'next/server';

// Mock database
let items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
];

// GET: Retrieve all items
export async function GET() {
  return NextResponse.json(items);
}

// POST: Create a new item
export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const newItem = { id: Date.now(), name };
    items.push(newItem);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// PUT: Update an existing item
export async function PUT(request: Request) {
    try {
        const { id, name } = await request.json();
        if (!id || !name) {
            return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
        }
        const itemIndex = items.findIndex(item => item.id === id);
        if (itemIndex === -1) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }
        items[itemIndex] = { ...items[itemIndex], name };
        return NextResponse.json(items[itemIndex]);
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}

// DELETE: Remove an item
export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }
        const initialLength = items.length;
        items = items.filter(item => item.id !== id);
        if (items.length === initialLength) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }
        return new NextResponse(null, { status: 204 }); // No Content
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
