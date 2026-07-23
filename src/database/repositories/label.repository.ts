import { randomUUID } from 'crypto';
import { eq, asc } from 'drizzle-orm';
import { getDb } from '../client';
import { tags } from '../schema';
import type { Label, CreateLabelInput } from '../../shared/ipc/types';

const DEFAULT_COLORS = ['#0d9488', '#0284c7', '#ea580c', '#dc2626', '#7c3aed', '#64748b'];

function mapLabel(row: typeof tags.$inferSelect): Label {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
  };
}

export const labelRepository = {
  list(): Label[] {
    const db = getDb();
    return db.select().from(tags).orderBy(asc(tags.name)).all().map(mapLabel);
  },

  create(input: CreateLabelInput): Label {
    const db = getDb();
    const name = input.name.trim();
    if (!name) throw new Error('Label name is required');

    const existing = db.select().from(tags).where(eq(tags.name, name)).get();
    if (existing) return mapLabel(existing);

    const count = db.select().from(tags).all().length;
    const row = {
      id: randomUUID(),
      name,
      color: input.color ?? DEFAULT_COLORS[count % DEFAULT_COLORS.length]!,
    };
    db.insert(tags).values(row).run();
    return mapLabel(row);
  },

  delete(id: string): void {
    const db = getDb();
    db.delete(tags).where(eq(tags.id, id)).run();
  },

  getByName(name: string): Label | null {
    const db = getDb();
    const row = db.select().from(tags).where(eq(tags.name, name)).get();
    return row ? mapLabel(row) : null;
  },
};
