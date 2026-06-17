import { pgTable, serial, text, timestamp, doublePrecision, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (UID is Firebase UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), 
  email: text('email').notNull(),
  name: text('name').notNull().default('Climate Warden'),
  passwordHash: text('password_hash'),
  salt: text('salt'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Chat messages table
export const chats = pgTable('chats', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // maps to users.uid
  sender: text('sender').notNull(), // 'user' | 'assistant'
  message: text('message').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Weather snapshots table
export const weatherSnapshots = pgTable('weather_snapshots', {
  id: serial('id').primaryKey(),
  city: text('city').notNull(),
  temp: doublePrecision('temp').notNull(),
  humidity: integer('humidity').notNull(),
  windSpeed: doublePrecision('wind_speed').notNull(),
  condition: text('condition').notNull(),
  aqi: integer('aqi').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Seismic Logs table
export const seismicLogs = pgTable('seismic_logs', {
  id: serial('id').primaryKey(),
  place: text('place').notNull(),
  magnitude: doublePrecision('magnitude').notNull(),
  depth: doublePrecision('depth').notNull(),
  time: doublePrecision('time').notNull(), // timestamp value from USGS
  tsunami: integer('tsunami').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Warehouses table
export const warehouses = pgTable('warehouses', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  lat: doublePrecision('lat').notNull(),
  lon: doublePrecision('lon').notNull(),
  generators: integer('generators').notNull().default(0),
  waterContainers: integer('water_containers').notNull().default(0),
  rations: integer('rations').notNull().default(0),
  medicalKits: integer('medical_kits').notNull().default(0),
});

// Supply cargo table
export const supplyCargo = pgTable('supply_cargo', {
  id: text('id').primaryKey(),
  cargoName: text('cargo_name').notNull(),
  warehouseId: text('warehouse_id').notNull().references(() => warehouses.id),
  destination: text('destination').notNull(),
  status: text('status').notNull(), // 'In Transit' | 'Delayed' | 'Rerouted' | 'Delivered'
  lat: doublePrecision('lat').notNull(),
  lon: doublePrecision('lon').notNull(),
  riskLevel: text('risk_level').notNull(), // 'low' | 'medium' | 'high'
  notifiedHazard: text('notified_hazard').notNull(),
});

// Alerts table to store real-time generated alarms
export const alerts = pgTable('alerts', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'seismic' | 'weather' | 'system'
  severity: text('severity').notNull(), // 'info' | 'warning' | 'critical'
  title: text('title').notNull(),
  message: text('message').notNull(),
  timestamp: doublePrecision('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  chats: many(chats),
}));

export const chatsRelations = relations(chats, ({ one }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.uid],
  }),
}));

export const warehousesRelations = relations(warehouses, ({ many }) => ({
  cargo: many(supplyCargo),
}));

export const supplyCargoRelations = relations(supplyCargo, ({ one }) => ({
  warehouse: one(warehouses, {
    fields: [supplyCargo.warehouseId],
    references: [warehouses.id],
  }),
}));
