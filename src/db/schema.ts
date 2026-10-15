import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('buyer'),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cd_batches = pgTable('cd_batches', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  materialType: text('material_type').notNull(),
  materialSubtype: text('material_subtype').notNull(),
  quantity: integer('quantity').notNull(),
  unit: text('unit').notNull(),
  pricePerUnit: integer('price_per_unit').notNull(),
  locationName: text('location_name').notNull(),
  latitude: text('latitude').notNull(),
  longitude: text('longitude').notNull(),
  status: text('status').default('available'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cd_demands = pgTable('cd_demands', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  materialType: text('material_type').notNull(),
  materialSubtype: text('material_subtype').notNull(),
  quantityNeeded: integer('quantity_needed').notNull(),
  unit: text('unit').notNull(),
  maxPricePerUnit: integer('max_price_per_unit').notNull(),
  siteName: text('site_name').notNull(),
  latitude: text('latitude').notNull(),
  longitude: text('longitude').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cd_orders = pgTable('cd_orders', {
  id: text('id').primaryKey(),
  batchId: text('batch_id').notNull(),
  demandId: text('demand_id').notNull(),
  quantity: integer('quantity').notNull(),
  orderType: text('order_type').notNull(),
  status: text('status').notNull(),
  matchScore: integer('match_score').notNull(),
  buyerEmail: text('buyer_email'),
  sellerEmail: text('seller_email'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const sync_logs = pgTable('sync_logs', {
  id: serial('id').primaryKey(),
  action: text('action').notNull(),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow(),
});
