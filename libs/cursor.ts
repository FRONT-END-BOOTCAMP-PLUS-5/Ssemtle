export type Cursor = { t: string; id: number };

export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}

export function decodeCursor(encoded: string): Cursor {
  try {
    const decoded = Buffer.from(encoded, 'base64url').toString('utf8');
    const cursor = JSON.parse(decoded);

    if (!cursor || typeof cursor !== 'object') {
      throw new Error('Invalid cursor format');
    }

    if (typeof cursor.t !== 'string' || typeof cursor.id !== 'number') {
      throw new Error('Invalid cursor structure');
    }

    return cursor as Cursor;
  } catch {
    throw new Error('Failed to decode cursor');
  }
}
