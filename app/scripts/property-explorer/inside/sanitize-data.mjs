#!/usr/bin/env node
/** Build-time allowlist for the unmodified Farm House construction model. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error('Usage: sanitize-data.mjs SOURCE.json OUTPUT.json');
const raw = JSON.parse(await readFile(input, 'utf8'));
const certainty = (value) => ['dimensioned', 'derived', 'approximate', 'schematic', 'conflict'].includes(value) ? value : 'approximate';
const opening = ({ id, name, wall_id, offset_in, width_in, height_in, sill_in, kind, confidence }) => ({ id, name, wall_id, offset_in, width_in, height_in, sill_in, kind, confidence: certainty(confidence) });
const safe = {
  schema: 'farm-house-construction-safe-v2', length_unit: 'inches', render_unit: 'metres', policy: 'Geometry and uncertainty labels only. Not an as-built record.',
  local_placement: { east_ft: raw.house.world.front_plane_local_east_ft, north_ft: raw.house.world.north_plane_local_north_ft },
  house: {
    outline: raw.house.outline, openings: raw.house.openings.map(opening),
    walls: raw.house.walls.map((wall) => ({ id: wall.id, name: wall.name, a: wall.a, b: wall.b, exterior: Boolean(wall.exterior), core_in: wall.core_in, height_in: wall.height_in, openings: wall.openings.map(opening) })),
    rooms: raw.house.rooms.map((room) => ({ id: room.id, name: room.name, polygon: room.polygon, center: room.center, ceiling_in: room.ceiling_in, finish: room.finish, confidence: certainty(room.confidence) })),
    fixtures: raw.house.fixtures.map((fixture) => ({ id: fixture.id, name: fixture.name, kind: fixture.kind, at: fixture.at, angle: fixture.angle, room: fixture.room, size_in: fixture.size_in, confidence: certainty(fixture.confidence) })),
    porches: raw.house.porches.map((porch) => ({ id: porch.id, name: porch.name, polygon: porch.polygon, confidence: certainty(porch.confidence) })),
  },
  truss_vectors: raw.truss_vectors.map(({ mark, members, confidence }) => ({ mark, members: members.map(({ polygon_in, width_in }) => ({ polygon_in, width_in })), confidence: certainty(confidence) })),
  trusses: raw.trusses.map(({ mark, type, quantity, plies, profile_width_in, profile_height_in, top_chord_pitch_over_12 }) => ({ mark, type, quantity, plies, profile_width_in, profile_height_in, top_chord_pitch_over_12 })),
  electrical_devices: raw.electrical_devices.map(({ id, kind, at, confidence, height_in }) => ({ id, kind, at, confidence: certainty(confidence), height_in })),
};
const serialized = JSON.stringify(safe);
if (/(?:D\d{2}-P\d{3}|source_questions|reference_images|owner_confirmation|file_name|source_page|\bworld\b|\bparcel\b|\baddress\b|\bstreet\b|\blane\b|\bphoto\b|latitude|longitude|navd)/i.test(serialized)) throw new Error('Privacy assertion failed.');
await mkdir(dirname(output), { recursive: true }); await writeFile(output, serialized);
console.log(JSON.stringify({ ok: true, bytes: Buffer.byteLength(serialized), walls: safe.house.walls.length, trusses: safe.truss_vectors.length }));
