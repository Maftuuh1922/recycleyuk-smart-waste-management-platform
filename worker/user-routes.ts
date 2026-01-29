import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, RequestEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { Request as WasteRequest, UserRole } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.post('/api/auth/login', async (c) => {
    const { id } = (await c.req.json()) as { id: string };
    const user = new UserEntity(c.env, id);
    if (!await user.exists()) return bad(c, "User not found");
    return ok(c, await user.getState());
  });
  app.get('/api/users/list', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const { items } = await UserEntity.list(c.env);
    return ok(c, items);
  });
  app.patch('/api/users/:id/status', async (c) => {
    const { isOnline } = (await c.req.json()) as { isOnline: boolean };
    const user = new UserEntity(c.env, c.req.param('id'));
    if (!await user.exists()) return notFound(c);
    const updated = await user.mutate(s => ({ ...s, isOnline }));
    return ok(c, updated);
  });
  app.get('/api/requests', async (c) => {
    await RequestEntity.ensureSeed(c.env);
    const userId = c.req.query('userId');
    const role = c.req.query('role') as UserRole;
    const { items } = await RequestEntity.list(c.env);
    let filtered = items;
    if (role === 'WARGA' && userId) {
      filtered = items.filter(r => r.userId === userId);
    } else if (role === 'TPU') {
      filtered = items.filter(r => r.status === 'PENDING' || r.collectorId === userId);
    }
    return ok(c, filtered.sort((a, b) => b.createdAt - a.createdAt));
  });
  app.post('/api/requests', async (c) => {
    const body = (await c.req.json()) as Partial<WasteRequest>;
    if (!body.userId || !body.wasteType) return bad(c, "Missing required fields");
    const newRequest: WasteRequest = {
      id: crypto.randomUUID(),
      userId: body.userId,
      status: 'PENDING',
      wasteType: body.wasteType as any,
      weightEstimate: body.weightEstimate || 0,
      location: body.location || { lat: -6.2247, lng: 106.8077, address: "RW 04 Area" },
      photos: body.photos || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await RequestEntity.create(c.env, newRequest);
    return ok(c, newRequest);
  });
  app.get('/api/requests/:id', async (c) => {
    const req = new RequestEntity(c.env, c.req.param('id'));
    if (!await req.exists()) return notFound(c);
    return ok(c, await req.getState());
  });
  app.patch('/api/requests/:id/status', async (c) => {
    const { status, collectorId, proofPhoto } = (await c.req.json()) as { status: string, collectorId?: string, proofPhoto?: string };
    const req = new RequestEntity(c.env, c.req.param('id'));
    if (!await req.exists()) return notFound(c);
    const updated = await req.mutate(s => ({
      ...s,
      status: status as any,
      collectorId: collectorId || s.collectorId,
      proofPhoto: proofPhoto || s.proofPhoto,
      updatedAt: Date.now(),
      completedAt: status === 'COMPLETED' ? Date.now() : s.completedAt
    }));
    console.log(`[WHATSAPP MOCK] Status Update: ${status} for Request ${updated.id}`);
    return ok(c, updated);
  });
  app.get('/api/admin/stats', async (c) => {
    const { items: requests } = await RequestEntity.list(c.env);
    const { items: users } = await UserEntity.list(c.env);
    const distribution = [
      { name: 'Organic', value: requests.filter(r => r.wasteType === 'ORGANIC').length },
      { name: 'Non-Organic', value: requests.filter(r => r.wasteType === 'NON_ORGANIC').length },
      { name: 'B3', value: requests.filter(r => r.wasteType === 'B3').length },
      { name: 'Residue', value: requests.filter(r => r.wasteType === 'RESIDUE').length },
    ];
    return ok(c, {
      wasteDistribution: distribution,
      totalCount: requests.length,
      onlineCollectors: users.filter(u => u.role === 'TPU' && u.isOnline).length
    });
  });
}