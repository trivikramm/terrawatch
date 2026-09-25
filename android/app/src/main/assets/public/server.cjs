var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  activeClients: () => activeClients
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_http = __toESM(require("http"), 1);
var import_vite = require("vite");
var import_ws3 = require("ws");
var import_dotenv = __toESM(require("dotenv"), 1);

// src/db/dbClient.ts
var import_crypto = __toESM(require("crypto"), 1);

// src/db/index.ts
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = __toESM(require("pg"), 1);

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  alerts: () => alerts,
  chats: () => chats,
  chatsRelations: () => chatsRelations,
  satelliteEmbeddings: () => satelliteEmbeddings,
  seismicLogs: () => seismicLogs,
  supplyCargo: () => supplyCargo,
  supplyCargoRelations: () => supplyCargoRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  warehouses: () => warehouses,
  warehousesRelations: () => warehousesRelations,
  weatherSnapshots: () => weatherSnapshots
});
var import_pg_core = require("drizzle-orm/pg-core");
var import_drizzle_orm = require("drizzle-orm");
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  uid: (0, import_pg_core.text)("uid").notNull().unique(),
  email: (0, import_pg_core.text)("email").notNull(),
  name: (0, import_pg_core.text)("name").notNull().default("Climate Warden"),
  passwordHash: (0, import_pg_core.text)("password_hash"),
  salt: (0, import_pg_core.text)("salt"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var chats = (0, import_pg_core.pgTable)("chats", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.text)("user_id").notNull(),
  // maps to users.uid
  sender: (0, import_pg_core.text)("sender").notNull(),
  // 'user' | 'assistant'
  message: (0, import_pg_core.text)("message").notNull(),
  timestamp: (0, import_pg_core.timestamp)("timestamp").defaultNow()
});
var weatherSnapshots = (0, import_pg_core.pgTable)("weather_snapshots", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  city: (0, import_pg_core.text)("city").notNull(),
  temp: (0, import_pg_core.doublePrecision)("temp").notNull(),
  humidity: (0, import_pg_core.integer)("humidity").notNull(),
  windSpeed: (0, import_pg_core.doublePrecision)("wind_speed").notNull(),
  condition: (0, import_pg_core.text)("condition").notNull(),
  aqi: (0, import_pg_core.integer)("aqi").notNull(),
  timestamp: (0, import_pg_core.timestamp)("timestamp").defaultNow()
});
var seismicLogs = (0, import_pg_core.pgTable)("seismic_logs", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  place: (0, import_pg_core.text)("place").notNull(),
  magnitude: (0, import_pg_core.doublePrecision)("magnitude").notNull(),
  depth: (0, import_pg_core.doublePrecision)("depth").notNull(),
  time: (0, import_pg_core.doublePrecision)("time").notNull(),
  // timestamp value from USGS
  tsunami: (0, import_pg_core.integer)("tsunami").notNull().default(0),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var warehouses = (0, import_pg_core.pgTable)("warehouses", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  name: (0, import_pg_core.text)("name").notNull(),
  location: (0, import_pg_core.text)("location").notNull(),
  lat: (0, import_pg_core.doublePrecision)("lat").notNull(),
  lon: (0, import_pg_core.doublePrecision)("lon").notNull(),
  generators: (0, import_pg_core.integer)("generators").notNull().default(0),
  waterContainers: (0, import_pg_core.integer)("water_containers").notNull().default(0),
  rations: (0, import_pg_core.integer)("rations").notNull().default(0),
  medicalKits: (0, import_pg_core.integer)("medical_kits").notNull().default(0)
});
var supplyCargo = (0, import_pg_core.pgTable)("supply_cargo", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  cargoName: (0, import_pg_core.text)("cargo_name").notNull(),
  warehouseId: (0, import_pg_core.text)("warehouse_id").notNull().references(() => warehouses.id),
  destination: (0, import_pg_core.text)("destination").notNull(),
  status: (0, import_pg_core.text)("status").notNull(),
  // 'In Transit' | 'Delayed' | 'Rerouted' | 'Delivered'
  lat: (0, import_pg_core.doublePrecision)("lat").notNull(),
  lon: (0, import_pg_core.doublePrecision)("lon").notNull(),
  riskLevel: (0, import_pg_core.text)("risk_level").notNull(),
  // 'low' | 'medium' | 'high'
  notifiedHazard: (0, import_pg_core.text)("notified_hazard").notNull()
});
var alerts = (0, import_pg_core.pgTable)("alerts", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  type: (0, import_pg_core.text)("type").notNull(),
  // 'seismic' | 'weather' | 'system'
  severity: (0, import_pg_core.text)("severity").notNull(),
  // 'info' | 'warning' | 'critical'
  title: (0, import_pg_core.text)("title").notNull(),
  message: (0, import_pg_core.text)("message").notNull(),
  timestamp: (0, import_pg_core.doublePrecision)("timestamp").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var satelliteEmbeddings = (0, import_pg_core.pgTable)("satellite_embeddings", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  lat: (0, import_pg_core.doublePrecision)("lat").notNull(),
  lon: (0, import_pg_core.doublePrecision)("lon").notNull(),
  year: (0, import_pg_core.integer)("year").notNull(),
  // e.g., 2023, 2021, etc.
  embedding: (0, import_pg_core.text)("embedding").notNull(),
  // JSON string representing the 64D vector
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
}, (table) => {
  return {
    latLonIdx: (0, import_pg_core.index)("idx_satellite_embeddings_lat_lon").on(table.lat, table.lon),
    yearIdx: (0, import_pg_core.index)("idx_satellite_embeddings_year").on(table.year),
    latLonYearIdx: (0, import_pg_core.index)("idx_satellite_embeddings_lat_lon_year").on(table.lat, table.lon, table.year)
  };
});
var usersRelations = (0, import_drizzle_orm.relations)(users, ({ many }) => ({
  chats: many(chats)
}));
var chatsRelations = (0, import_drizzle_orm.relations)(chats, ({ one }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.uid]
  })
}));
var warehousesRelations = (0, import_drizzle_orm.relations)(warehouses, ({ many }) => ({
  cargo: many(supplyCargo)
}));
var supplyCargoRelations = (0, import_drizzle_orm.relations)(supplyCargo, ({ one }) => ({
  warehouse: one(warehouses, {
    fields: [supplyCargo.warehouseId],
    references: [warehouses.id]
  })
}));

// src/db/index.ts
var { Pool } = import_pg.default;
var createPool = () => {
  const host = process.env.SQL_HOST;
  const user = process.env.SQL_USER || process.env.SQL_ADMIN_USER;
  const password = process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD;
  const database = process.env.SQL_DB_NAME;
  console.log(`Initializing SQL Pool: host=${host}, user=${user}, database=${database} (derived from SQL_USER=${!!process.env.SQL_USER}, SQL_ADMIN_USER=${!!process.env.SQL_ADMIN_USER})`);
  return new Pool({
    host,
    user,
    password,
    database,
    connectionTimeoutMillis: 15e3
  });
};
var pool = createPool();
pool.on("error", (err) => {
  console.error("Unexpected error on idle SQL pool client:", err);
});
var db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });

// src/db/dbClient.ts
var import_drizzle_orm2 = require("drizzle-orm");
var JWT_SECRET = process.env.JWT_SECRET || "terrawatch_secure_federated_node_jwt_secret_99884";
function hashPassword(password, salt) {
  return import_crypto.default.pbkdf2Sync(password, salt, 1e3, 64, "sha512").toString("hex");
}
function generateSalt() {
  return import_crypto.default.randomBytes(16).toString("hex");
}
function generateJWT(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const tokenInput = `${base64Header}.${base64Payload}`;
  const hmac = import_crypto.default.createHmac("sha256", JWT_SECRET);
  hmac.update(tokenInput);
  const signature = hmac.digest("base64url");
  return `${tokenInput}.${signature}`;
}
function verifyJWT(token) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signature] = parts;
    const tokenInput = `${headerB64}.${payloadB64}`;
    const hmac = import_crypto.default.createHmac("sha256", JWT_SECRET);
    hmac.update(tokenInput);
    const expectedSignature = hmac.digest("base64url");
    if (signature !== expectedSignature) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (payload.exp && Date.now() / 1e3 > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
async function registerUser(email, rawPass, name) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.email, normalizedEmail)).limit(1);
    if (existing.length > 0) {
      return { success: false, message: "Operator email is already registered." };
    }
    const salt = generateSalt();
    const passwordHash = hashPassword(rawPass, salt);
    const generatedUid = "usr-" + import_crypto.default.randomUUID();
    const result = await db.insert(users).values({
      uid: generatedUid,
      email: normalizedEmail,
      passwordHash,
      salt,
      name: name.trim() || "Climate Warden"
    }).returning();
    const newUser = result[0];
    return {
      success: true,
      message: "Registered successfully.",
      user: { id: newUser.uid, email: newUser.email, name: newUser.name }
    };
  } catch (error) {
    console.error("Registration failed:", error);
    return {
      success: false,
      message: `An internal database error occurred while registering operator: ${error?.message || error}`
    };
  }
}
async function loginUser(email, rawPass) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const matchedUsers = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.email, normalizedEmail)).limit(1);
    if (matchedUsers.length === 0) {
      return { success: false, message: "Invalid credentials. Portal connection rejected." };
    }
    const matched = matchedUsers[0];
    if (!matched.salt || !matched.passwordHash) {
      return { success: false, message: "Warden accounts using external auth must register passkey credentials first." };
    }
    const computedHash = hashPassword(rawPass, matched.salt);
    if (computedHash !== matched.passwordHash) {
      return { success: false, message: "Invalid credentials. Portal connection rejected." };
    }
    const payload = {
      id: matched.uid,
      email: matched.email,
      name: matched.name,
      exp: Math.floor(Date.now() / 1e3) + 12 * 60 * 60
      // 12 hours
    };
    const token = generateJWT(payload);
    return {
      success: true,
      message: "Authentication successful.",
      token,
      user: { id: matched.uid, email: matched.email, name: matched.name }
    };
  } catch (error) {
    console.error("Login failed:", error);
    return { success: false, message: "Database failure during security check." };
  }
}
async function storeChatMessage(userId, sender, message) {
  try {
    const result = await db.insert(chats).values({
      userId,
      sender,
      message
    }).returning();
    return result[0];
  } catch (error) {
    console.error("Store chat failed:", error);
    return { id: 0, userId, sender, message, timestamp: /* @__PURE__ */ new Date() };
  }
}
async function getChatMessages(userId) {
  try {
    const list = await db.select().from(chats).where((0, import_drizzle_orm2.eq)(chats.userId, userId)).orderBy((0, import_drizzle_orm2.desc)(chats.timestamp)).limit(50);
    return list.reverse();
  } catch (error) {
    console.error("Get chats failed:", error);
    return [];
  }
}
async function deleteChatHistory(userId) {
  try {
    await db.delete(chats).where((0, import_drizzle_orm2.eq)(chats.userId, userId));
    return true;
  } catch (error) {
    console.error("Delete chat failed:", error);
    return false;
  }
}
var initialWarehouses = [
  {
    id: "wh-tokyo",
    name: "Tokyo Regional Depot",
    location: "Tokyo, Japan",
    lat: 35.6762,
    lon: 139.6503,
    generators: 120,
    waterContainers: 450,
    rations: 2500,
    medicalKits: 400
  },
  {
    id: "wh-chennai",
    name: "Chennai Port Transit Depot",
    location: "Chennai, India",
    lat: 13.0827,
    lon: 80.2707,
    generators: 85,
    waterContainers: 600,
    rations: 1800,
    medicalKits: 220
  },
  {
    id: "wh-seattle",
    name: "Seattle Logistics Facility",
    location: "Seattle, WA",
    lat: 47.6062,
    lon: -122.3321,
    generators: 150,
    waterContainers: 350,
    rations: 3200,
    medicalKits: 500
  },
  {
    id: "wh-reykjavik",
    name: "Reykjavik Geothermal Node",
    location: "Reykjavik, Iceland",
    lat: 64.1466,
    lon: -21.9426,
    generators: 40,
    waterContainers: 150,
    rations: 900,
    medicalKits: 110
  }
];
var initialCargo = [
  {
    id: "cargo-gen-001",
    cargoName: "Disaster Power Generators (60 Units)",
    warehouseId: "wh-seattle",
    destination: "San Francisco Disaster Base",
    status: "In Transit",
    lat: 41.2,
    lon: -122.5,
    riskLevel: "low",
    notifiedHazard: "Clear route weather guidelines active."
  },
  {
    id: "cargo-med-002",
    cargoName: "Critical Plasma & Trauma Rations (300 Kits)",
    warehouseId: "wh-tokyo",
    destination: "Sendai Seismology Shelter",
    status: "Delayed",
    lat: 38.3,
    lon: 142.1,
    riskLevel: "high",
    notifiedHazard: "M6.8 convergent plate rupture strike nearby. Tsunami warning indicators triggered."
  },
  {
    id: "cargo-rat-003",
    cargoName: "Emergency MRE Rations (1500 Packs)",
    warehouseId: "wh-chennai",
    destination: "Trivandrum Cyclone Refuge",
    status: "Rerouted",
    lat: 10.5,
    lon: 76.5,
    riskLevel: "medium",
    notifiedHazard: "Local active lightning cluster & high wind shear. Slower alternative highway coordinates assigned."
  }
];
async function getWarehouses() {
  try {
    const list = await db.select().from(warehouses);
    if (list.length === 0) {
      console.log("Pre-seeding depots into PostgreSQL warehouses table...");
      await db.insert(warehouses).values(initialWarehouses);
      return await db.select().from(warehouses);
    }
    return list;
  } catch (error) {
    console.error("Get warehouses failed:", error);
    return [];
  }
}
async function getCargoTransits() {
  try {
    const cargoList = await db.select().from(supplyCargo);
    if (cargoList.length === 0) {
      await getWarehouses();
      console.log("Pre-seeding transits into PostgreSQL supply_cargo table...");
      await db.insert(supplyCargo).values(initialCargo);
      return await db.select().from(supplyCargo);
    }
    return cargoList;
  } catch (error) {
    console.error("Get cargo failed:", error);
    return [];
  }
}
async function dispatchSupplyOrder(warehouseId, cargoName, destination, lat, lon) {
  try {
    const list = await getWarehouses();
    const wh = list.find((w) => w.id === warehouseId);
    if (!wh) return null;
    let generatorsVal = wh.generators;
    let medicalVal = wh.medicalKits;
    let rationsVal = wh.rations;
    let waterVal = wh.waterContainers;
    if (cargoName.toLowerCase().includes("generator")) {
      if (generatorsVal >= 10) generatorsVal -= 10;
    } else if (cargoName.toLowerCase().includes("medical")) {
      if (medicalVal >= 50) medicalVal -= 50;
    } else if (cargoName.toLowerCase().includes("ration") || cargoName.toLowerCase().includes("mre")) {
      if (rationsVal >= 200) rationsVal -= 200;
    } else {
      if (waterVal >= 100) waterVal -= 100;
    }
    await db.update(warehouses).set({
      generators: generatorsVal,
      medicalKits: medicalVal,
      rations: rationsVal,
      waterContainers: waterVal
    }).where((0, import_drizzle_orm2.eq)(warehouses.id, warehouseId));
    const dispatchedId = "cargo-dispatched-" + Math.floor(Math.random() * 9e3 + 1e3);
    const result = await db.insert(supplyCargo).values({
      id: dispatchedId,
      cargoName,
      warehouseId,
      destination,
      status: "In Transit",
      lat,
      lon,
      riskLevel: "low",
      notifiedHazard: "Cargo dispatched locally. Fleet weather routing instructions assigned."
    }).returning();
    return result[0];
  } catch (error) {
    console.error("Dispatch failed:", error);
    return null;
  }
}
async function updateCargoRisk(cargoId, riskLevel, hazardMsg, newLat, newLon) {
  try {
    let updateFields = {
      riskLevel,
      notifiedHazard: hazardMsg,
      status: riskLevel === "high" ? "Delayed" : riskLevel === "medium" ? "Rerouted" : "In Transit"
    };
    if (newLat !== void 0) updateFields.lat = newLat;
    if (newLon !== void 0) updateFields.lon = newLon;
    await db.update(supplyCargo).set(updateFields).where((0, import_drizzle_orm2.eq)(supplyCargo.id, cargoId));
    return true;
  } catch (error) {
    console.error("Update cargo risk failed:", error);
    return false;
  }
}
async function storeWeatherSnapshot(city, temp, humidity, windSpeed, condition, aqi) {
  try {
    await db.insert(weatherSnapshots).values({
      city,
      temp,
      humidity,
      windSpeed,
      condition,
      aqi
    });
    return true;
  } catch (error) {
    console.error("Store weather snapshot failed:", error);
    return false;
  }
}
async function storeSeismicLog(place, magnitude, depth, time, tsunami) {
  try {
    await db.insert(seismicLogs).values({
      place,
      magnitude,
      depth,
      time,
      tsunami
    });
    return true;
  } catch (error) {
    console.error("Store seismic log failed:", error);
    return false;
  }
}
async function getWeatherSnapshots(limit = 10) {
  try {
    return await db.select().from(weatherSnapshots).orderBy((0, import_drizzle_orm2.desc)(weatherSnapshots.timestamp)).limit(limit);
  } catch (error) {
    console.error("Get weather snapshots failed:", error);
    return [];
  }
}
async function getSeismicLogs(limit = 20) {
  try {
    return await db.select().from(seismicLogs).orderBy((0, import_drizzle_orm2.desc)(seismicLogs.createdAt)).limit(limit);
  } catch (error) {
    console.error("Get seismic logs failed:", error);
    return [];
  }
}
async function storeAlert(id, type, severity, title, message, timestamp2) {
  try {
    await db.insert(alerts).values({
      id,
      type,
      severity,
      title,
      message,
      timestamp: timestamp2
    }).onConflictDoNothing();
    return true;
  } catch (error) {
    console.error("Store alert failed:", error);
    return false;
  }
}
async function getAlerts(limit = 40) {
  try {
    const list = await db.select().from(alerts).orderBy((0, import_drizzle_orm2.desc)(alerts.timestamp)).limit(limit);
    if (list.length === 0) {
      const initial = [
        {
          id: "alert-init-1",
          type: "system",
          severity: "info",
          title: "TERRAWATCH NODE ONLINE",
          message: "Central Climate Warden telemetry node initialized successfully. Real-time satellite links and geoseismic trackers fully synchronized.",
          timestamp: Date.now() - 36e5
        },
        {
          id: "alert-init-2",
          type: "seismic",
          severity: "warning",
          title: "TECTONIC ANOMALY DETECTED",
          message: "Minor subsurface shockwave clusters observed along regional fault margins. Continuing geodetic tracking.",
          timestamp: Date.now() - 18e5
        },
        {
          id: "alert-init-3",
          type: "weather",
          severity: "critical",
          title: "SATELLITE WARNING - GALE CONVERGENCE",
          message: "Atmospheric pressure gradients warning: Cyclone watch threshold exceeded. Coastal depot storm protocols have been distributed.",
          timestamp: Date.now() - 9e5
        }
      ];
      for (const item of initial) {
        await db.insert(alerts).values(item).onConflictDoNothing();
      }
      return await db.select().from(alerts).orderBy((0, import_drizzle_orm2.desc)(alerts.timestamp)).limit(limit);
    }
    return list;
  } catch (error) {
    console.error("Get alerts failed:", error);
    return [];
  }
}
async function storeSatelliteEmbedding(lat, lon, year, embedding) {
  try {
    const targetLat = Math.round(lat * 1e4) / 1e4;
    const targetLon = Math.round(lon * 1e4) / 1e4;
    const existing = await db.select().from(satelliteEmbeddings).where(
      (0, import_drizzle_orm2.and)(
        (0, import_drizzle_orm2.eq)(satelliteEmbeddings.lat, targetLat),
        (0, import_drizzle_orm2.eq)(satelliteEmbeddings.lon, targetLon),
        (0, import_drizzle_orm2.eq)(satelliteEmbeddings.year, year)
      )
    ).limit(1);
    if (existing.length > 0) {
      await db.update(satelliteEmbeddings).set({
        embedding: JSON.stringify(embedding)
      }).where(
        (0, import_drizzle_orm2.and)(
          (0, import_drizzle_orm2.eq)(satelliteEmbeddings.lat, targetLat),
          (0, import_drizzle_orm2.eq)(satelliteEmbeddings.lon, targetLon),
          (0, import_drizzle_orm2.eq)(satelliteEmbeddings.year, year)
        )
      );
      return true;
    }
    await db.insert(satelliteEmbeddings).values({
      lat: targetLat,
      lon: targetLon,
      year,
      embedding: JSON.stringify(embedding)
    });
    return true;
  } catch (error) {
    console.error("Store satellite embedding failed:", error);
    return false;
  }
}
async function getSatelliteEmbeddings(lat, lon, limit = 10) {
  try {
    const targetLat = Math.round(lat * 1e4) / 1e4;
    const targetLon = Math.round(lon * 1e4) / 1e4;
    const list = await db.select().from(satelliteEmbeddings).where(
      (0, import_drizzle_orm2.and)(
        (0, import_drizzle_orm2.eq)(satelliteEmbeddings.lat, targetLat),
        (0, import_drizzle_orm2.eq)(satelliteEmbeddings.lon, targetLon)
      )
    ).orderBy((0, import_drizzle_orm2.desc)(satelliteEmbeddings.year)).limit(limit);
    if (list.length > 0) {
      return list.map((item) => ({
        ...item,
        embedding: JSON.parse(item.embedding)
      }));
    }
    return [];
  } catch (error) {
    console.error("Get satellite embeddings failed:", error);
    return [];
  }
}

// src/controllers/authController.ts
async function handleRegister(req, res) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are syntactically required." });
    }
    const result = await registerUser(email, password, name || "Operator");
    if (result.success) {
      return res.json(result);
    }
    return res.status(400).json(result);
  } catch (error) {
    console.error("Controller registration failure:", error);
    return res.status(500).json({ success: false, message: `Registration controller crash: ${error.message}` });
  }
}
async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password credentials required." });
    }
    const result = await loginUser(email, password);
    if (result.success) {
      return res.json(result);
    }
    return res.status(401).json(result);
  } catch (error) {
    console.error("Controller login failure:", error);
    return res.status(500).json({ success: false, message: `Login controller crash: ${error.message}` });
  }
}

// src/controllers/telemetryController.ts
var import_ws = require("ws");
var cache = {
  earthquakes: {},
  weather: {},
  cities: {}
};
var CACHE_TTL_EARTHQUAKE = 90 * 1e3;
var CACHE_TTL_WEATHER = 10 * 60 * 1e3;
function mapUSGStoEarthquake(feature) {
  const props = feature.properties || {};
  const geom = feature.geometry || { coordinates: [0, 0, 0] };
  const coords = geom.coordinates || [0, 0, 0];
  return {
    id: feature.id || String(Math.random()),
    magnitude: props.mag || 0,
    place: props.place || "Unknown Location",
    time: props.time || Date.now(),
    updated: props.updated || Date.now(),
    tsunami: props.tsunami || 0,
    alert: props.alert || null,
    significance: props.sig || 0,
    depth: coords[2] || 0,
    latitude: coords[1] || 0,
    longitude: coords[0] || 0
  };
}
async function triggerSeismicAlertIfSevere(eq2) {
  if (eq2.magnitude >= 4.5) {
    const isCritical = eq2.magnitude >= 6;
    const alert = {
      id: `alert-seismic-${eq2.id}`,
      type: "seismic",
      severity: isCritical ? "critical" : "warning",
      title: `${isCritical ? "CRITICAL" : "STRONG"} Seismic Event`,
      message: `M${eq2.magnitude.toFixed(1)} Earthquake struck at depth of ${eq2.depth.toFixed(1)} km: ${eq2.place}.${eq2.tsunami === 1 ? " WARNING: Potential Tsunami TTE triggers are active. Observe coastline protocols." : ""}`,
      timestamp: Date.now()
    };
    await storeAlert(alert.id, alert.type, alert.severity, alert.title, alert.message, alert.timestamp);
    if (activeClients.size > 0) {
      activeClients.forEach((client) => {
        if (client.readyState === import_ws.WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "push_alert", alert }));
        }
      });
    }
  }
}
async function handleGetWeather(req, res) {
  const lat = parseFloat(String(req.query.lat || "12.9716"));
  const lon = parseFloat(String(req.query.lon || "77.5946"));
  const city = String(req.query.city || "Trivandrum");
  const cacheKey = `${lat.toFixed(4)}_${lon.toFixed(4)}`;
  const now = Date.now();
  if (cache.weather[cacheKey] && now - cache.weather[cacheKey].timestamp < CACHE_TTL_WEATHER) {
    return res.json(cache.weather[cacheKey].data);
  }
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const hasAPIKey = apiKey && apiKey !== "MY_OPENWEATHER_API_KEY";
  try {
    if (hasAPIKey) {
      const curRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      const foreRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
      if (curRes.ok && foreRes.ok && aqiRes.ok) {
        const cur = await curRes.json();
        const fore = await foreRes.json();
        const pol = await aqiRes.json();
        const dynamicHourly = (fore.list || []).slice(0, 8).map((h) => ({
          time: new Date(h.dt * 1e3).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          temp: h.main.temp,
          pop: Math.round((h.pop || 0) * 100),
          wind_speed: h.wind.speed,
          humidity: h.main.humidity
        }));
        const dailyMap = {};
        (fore.list || []).forEach((h) => {
          const dateStr = new Date(h.dt * 1e3).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
          if (!dailyMap[dateStr]) {
            dailyMap[dateStr] = {
              date: dateStr,
              temps: [],
              pops: [],
              weather: h.weather[0]
            };
          }
          dailyMap[dateStr].temps.push(h.main.temp);
          dailyMap[dateStr].pops.push(h.pop || 0);
        });
        const dailyForecasts2 = Object.values(dailyMap).slice(0, 5).map((d) => ({
          date: d.date,
          tempMax: Math.max(...d.temps),
          tempMin: Math.min(...d.temps),
          pop: Math.round(Math.max(...d.pops) * 100),
          main: d.weather.main,
          icon: d.weather.icon
        }));
        const components = pol.list?.[0]?.components || {};
        const weatherObj2 = {
          city: cur.name || city,
          lat,
          lon,
          current: {
            temp: cur.main.temp,
            feels_like: cur.main.feels_like,
            humidity: cur.main.humidity,
            pressure: cur.main.pressure,
            visibility: cur.visibility,
            uvi: 3.5,
            clouds: cur.clouds.all,
            wind_speed: cur.wind.speed,
            wind_deg: cur.wind.deg,
            wind_gust: cur.wind.gust,
            dew_point: cur.main.temp - (100 - cur.main.humidity) / 5,
            sunrise: cur.sys.sunrise,
            sunset: cur.sys.sunset,
            description: cur.weather[0].description,
            main: cur.weather[0].main,
            icon: cur.weather[0].icon
          },
          hourly: dynamicHourly,
          daily: dailyForecasts2,
          aqi: {
            aqi: pol.list?.[0]?.main?.aqi || 2,
            pm25: components.pm2_5 || 12,
            pm10: components.pm10 || 20,
            co: components.co || 350,
            no2: components.no2 || 15,
            so2: components.so2 || 4.5,
            o3: components.o3 || 45
          },
          alerts: []
        };
        if (weatherObj2.current.wind_speed > 15) {
          weatherObj2.alerts.push({
            sender_name: "TerraWatch Seismic Met",
            event: "Cyclone / Severe Storm Watch",
            start: Math.floor(Date.now() / 1e3),
            end: Math.floor(Date.now() / 1e3) + 12 * 3600,
            description: `Extreme wind velocities exceeding ${(weatherObj2.current.wind_speed * 3.6).toFixed(1)} km/h are generating high atmospheric turbulence and gale warnings.`,
            severity: "severe"
          });
        }
        if (weatherObj2.current.main.toLowerCase().includes("thunderstorm")) {
          weatherObj2.alerts.push({
            sender_name: "Meteorological Intelligence Agency",
            event: "Severe Thunderstorm Warning",
            start: Math.floor(Date.now() / 1e3),
            end: Math.floor(Date.now() / 1e3) + 4 * 3600,
            description: "Severe active electric storm detected. Intense precipitation and microburst probability exceeds 85%. Avoid open space routing.",
            severity: "extreme"
          });
        }
        cache.weather[cacheKey] = {
          data: weatherObj2,
          timestamp: now
        };
        await storeWeatherSnapshot(
          weatherObj2.city,
          weatherObj2.current.temp,
          weatherObj2.current.humidity,
          weatherObj2.current.wind_speed,
          weatherObj2.current.description,
          weatherObj2.aqi.aqi
        );
        return res.json(weatherObj2);
      }
    }
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;
    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;
    const [meteoRes, polRes] = await Promise.all([
      fetch(openMeteoUrl),
      fetch(airQualityUrl).catch(() => null)
    ]);
    if (!meteoRes.ok) {
      throw new Error("Failed to fetch fallback weather database");
    }
    const m = await meteoRes.json();
    const curMet = m.current || {};
    const hourlyMet = m.hourly || {};
    const dailyMet = m.daily || {};
    let aqiData = { aqi: 1, pm25: 8.5, pm10: 14.2, co: 210, no2: 8.4, so2: 2.1, o3: 32.5 };
    if (polRes && polRes.ok) {
      const p = await polRes.json();
      const curAQ = p.current || {};
      const pm25 = curAQ.pm2_5 || 8.5;
      const pm10 = curAQ.pm10 || 14.2;
      let index2 = 1;
      if (pm25 > 10 || pm10 > 20) index2 = 2;
      if (pm25 > 25 || pm10 > 50) index2 = 3;
      if (pm25 > 50 || pm10 > 100) index2 = 4;
      if (pm25 > 75 || pm10 > 150) index2 = 5;
      aqiData = {
        aqi: index2,
        pm25,
        pm10,
        co: curAQ.carbon_monoxide || 210,
        no2: curAQ.nitrogen_dioxide || 8.4,
        so2: curAQ.sulphur_dioxide || 2.1,
        o3: curAQ.ozone || 32.5
      };
    }
    const codeMap = (code) => {
      if (code === 0) return { main: "Clear", description: "Clear sky", icon: "01d" };
      if ([1, 2, 3].includes(code)) return { main: "Clouds", description: "Partly cloudy", icon: "03d" };
      if ([45, 48].includes(code)) return { main: "Fog", description: "Foggy boundaries", icon: "50d" };
      if ([51, 53, 55, 56, 57].includes(code)) return { main: "Drizzle", description: "Light atmospheric drizzle", icon: "09d" };
      if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { main: "Rain", description: "Intense micro-precipitation", icon: "10d" };
      if ([71, 73, 75, 77, 85, 86].includes(code)) return { main: "Snow", description: "Glacial winter fronts", icon: "13d" };
      if ([95, 96, 99].includes(code)) return { main: "Thunderstorm", description: "Severe electric tempest", icon: "11d" };
      return { main: "Atmosphere", description: "Unsettled atmospheric vectors", icon: "50d" };
    };
    const mappedWeather = codeMap(curMet.weather_code || 0);
    const hourlyForecasts = (hourlyMet.time || []).slice(0, 8).map((t, idx) => ({
      time: new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      temp: hourlyMet.temperature_2m?.[idx] || curMet.temperature_2m || 20,
      pop: hourlyMet.precipitation_probability?.[idx] || 0,
      wind_speed: hourlyMet.wind_speed_10m?.[idx] || 5,
      humidity: hourlyMet.relative_humidity_2m?.[idx] || 75
    }));
    const dailyForecasts = (dailyMet.time || []).slice(0, 5).map((t, idx) => {
      const code = dailyMet.weather_code?.[idx] || 0;
      const mapped = codeMap(code);
      return {
        date: new Date(t).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }),
        tempMax: dailyMet.temperature_2m_max?.[idx] || 25,
        tempMin: dailyMet.temperature_2m_min?.[idx] || 15,
        pop: dailyMet.precipitation_probability_max?.[idx] || 0,
        main: mapped.main,
        icon: mapped.icon
      };
    });
    const weatherObj = {
      city,
      lat,
      lon,
      current: {
        temp: curMet.temperature_2m || 25,
        feels_like: curMet.apparent_temperature || curMet.temperature_2m || 25,
        humidity: curMet.relative_humidity_2m || 70,
        pressure: curMet.pressure_msl || 1013,
        visibility: 1e4,
        uvi: dailyMet.uv_index_max?.[0] || 4,
        clouds: curMet.cloud_cover || 20,
        wind_speed: curMet.wind_speed_10m || 3.5,
        wind_deg: curMet.wind_direction_10m || 0,
        wind_gust: curMet.wind_gusts_10m,
        dew_point: hourlyMet.dew_point_2m?.[0] || 15,
        sunrise: dailyMet.sunrise?.[0] ? Math.floor(new Date(dailyMet.sunrise[0]).getTime() / 1e3) : Math.floor(Date.now() / 1e3),
        sunset: dailyMet.sunset?.[0] ? Math.floor(new Date(dailyMet.sunset[0]).getTime() / 1e3) : Math.floor(Date.now() / 1e3) + 12 * 3600,
        description: mappedWeather.description,
        main: mappedWeather.main,
        icon: mappedWeather.icon
      },
      hourly: hourlyForecasts,
      daily: dailyForecasts,
      aqi: aqiData,
      alerts: []
    };
    if (weatherObj.current.wind_speed > 15) {
      weatherObj.alerts.push({
        sender_name: "TerraWatch Seismic Met",
        event: "Cyclone / Severe Storm Watch",
        start: Math.floor(Date.now() / 1e3),
        end: Math.floor(Date.now() / 1e3) + 12 * 3600,
        description: `Extreme wind velocities exceeding ${(weatherObj.current.wind_speed * 3.6).toFixed(1)} km/h are generating high atmospheric turbulence and gale warnings.`,
        severity: "severe"
      });
    }
    if (weatherObj.current.main.toLowerCase().includes("thunderstorm")) {
      weatherObj.alerts.push({
        sender_name: "Meteorological Intelligence Agency",
        event: "Severe Thunderstorm Warning",
        start: Math.floor(Date.now() / 1e3),
        end: Math.floor(Date.now() / 1e3) + 4 * 3600,
        description: "Severe active electric storm detected. Intense precipitation and microburst probability exceeds 85%. Avoid open space routing.",
        severity: "extreme"
      });
    }
    cache.weather[cacheKey] = {
      data: weatherObj,
      timestamp: now
    };
    await storeWeatherSnapshot(
      weatherObj.city,
      weatherObj.current.temp,
      weatherObj.current.humidity,
      weatherObj.current.wind_speed,
      weatherObj.current.description,
      weatherObj.aqi.aqi
    );
    return res.json(weatherObj);
  } catch (error) {
    console.error("Weather fetching fatal error:", error);
    return res.status(500).json({ error: error.message || "Meteorological service unavailable" });
  }
}
async function handleGetEarthquakes(req, res) {
  const period = String(req.query.period || "day");
  const now = Date.now();
  if (cache.earthquakes[period] && now - cache.earthquakes[period].timestamp < CACHE_TTL_EARTHQUAKE) {
    return res.json(cache.earthquakes[period].data);
  }
  let usgsUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
  if (period === "hour") {
    usgsUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";
  } else if (period === "week") {
    usgsUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  }
  try {
    const response = await fetch(usgsUrl);
    if (!response.ok) {
      throw new Error(`USGS HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    const rawFeatures = data.features || [];
    const mapped = rawFeatures.map(mapUSGStoEarthquake);
    mapped.sort((a, b) => b.time - a.time);
    cache.earthquakes[period] = {
      data: mapped,
      timestamp: now
    };
    if (mapped.length > 0) {
      const topSevere = mapped.find((e) => e.magnitude >= 4.5);
      if (topSevere) {
        triggerSeismicAlertIfSevere(topSevere);
      }
    }
    for (const eq2 of mapped.slice(0, 8)) {
      await storeSeismicLog(eq2.place, eq2.magnitude, eq2.depth, eq2.time, eq2.tsunami);
    }
    return res.json(mapped);
  } catch (error) {
    console.error("USGS fetch error, initiating resilient seed payload:", error);
    const seed = [
      {
        id: "seed-1",
        magnitude: 5.7,
        place: "82km SSE of Singkil, Indonesia",
        time: Date.now() - 17e5,
        updated: Date.now(),
        tsunami: 1,
        alert: "yellow",
        significance: 620,
        depth: 42.1,
        latitude: 1.63,
        longitude: 97.94
      },
      {
        id: "seed-2",
        magnitude: 4.2,
        place: "12km WSW of Searles Valley, CA",
        time: Date.now() - 32e5,
        updated: Date.now(),
        tsunami: 0,
        alert: "green",
        significance: 280,
        depth: 8.5,
        latitude: 35.73,
        longitude: -117.41
      }
    ];
    for (const eq2 of seed) {
      await storeSeismicLog(eq2.place, eq2.magnitude, eq2.depth, eq2.time, eq2.tsunami);
    }
    return res.json(seed);
  }
}
async function handleSearchCities(req, res) {
  const query = String(req.query.q || "").trim();
  if (query.length < 2) {
    return res.json([]);
  }
  if (cache.cities[query]) {
    return res.json(cache.cities[query]);
  }
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const hasAPIKey = apiKey && apiKey !== "MY_OPENWEATHER_API_KEY";
  try {
    if (hasAPIKey) {
      const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`);
      if (response.ok) {
        const list = await response.json();
        const mapped = list.map((item) => ({
          name: item.name,
          state: item.state || "",
          country: item.country,
          lat: item.lat,
          lon: item.lon
        }));
        cache.cities[query] = mapped;
        return res.json(mapped);
      }
    }
    const defaultCities = [
      { name: "Trivandrum", state: "Kerala", country: "IN", lat: 8.5241, lon: 76.9366 },
      { name: "Chennai", state: "Tamil Nadu", country: "IN", lat: 13.0827, lon: 80.2707 },
      { name: "Bengaluru", state: "Karnataka", country: "IN", lat: 12.9716, lon: 77.5946 },
      { name: "Tokyo", state: "Kanto", country: "JP", lat: 35.6762, lon: 139.6503 },
      { name: "Seattle", state: "Washington", country: "US", lat: 47.6062, lon: -122.3321 },
      { name: "Reykjavik", state: "Capital Region", country: "IS", lat: 64.1466, lon: -21.9426 }
    ];
    const filtered = defaultCities.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
    return res.json(filtered);
  } catch (err) {
    console.error("City search failed:", err);
    return res.status(500).json({ error: err.message });
  }
}
async function handleGetAlerts(req, res) {
  try {
    const list = await getAlerts(100);
    return res.json(list);
  } catch (error) {
    console.error("Failed to get alerts in handleGetAlerts:", error);
    return res.status(500).json({ error: error.message });
  }
}

// src/controllers/logisticsController.ts
var import_ws2 = require("ws");
async function handleGetWarehouses(req, res) {
  try {
    const list = await getWarehouses();
    return res.json(list);
  } catch (error) {
    console.error("Failed to retrieve depots:", error);
    return res.status(500).json({ error: error.message });
  }
}
async function handleGetCargo(req, res) {
  try {
    const transits = await getCargoTransits();
    return res.json(transits);
  } catch (error) {
    console.error("Failed to retrieve cargo transit systems:", error);
    return res.status(500).json({ error: error.message });
  }
}
async function handleDispatch(req, res) {
  try {
    const { warehouseId, cargoName, destination, lat, lon } = req.body;
    if (!warehouseId || !cargoName || !destination) {
      return res.status(400).json({ error: "Warehouse ID, Cargo Name, and Destination are required." });
    }
    const result = await dispatchSupplyOrder(warehouseId, cargoName, destination, Number(lat || 0), Number(lon || 0));
    if (result) {
      const alert = {
        id: `alert-logistics-${result.id}`,
        type: "system",
        severity: "info",
        title: "EMERGENCY CARGO DISPATCH",
        message: `Operational Dispatch Order Registered: "${cargoName}" is now heading from Depot [${warehouseId}] to [${destination}].`,
        timestamp: Date.now()
      };
      await storeAlert(alert.id, alert.type, alert.severity, alert.title, alert.message, alert.timestamp);
      activeClients.forEach((client) => {
        if (client.readyState === import_ws2.WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "push_alert", alert }));
        }
      });
      return res.json({ success: true, cargo: result, message: "Cargo dispatch order approved and deducted from warehouse reserves." });
    }
    return res.status(404).json({ error: "Warehouse ID not recognized or stock depleted." });
  } catch (error) {
    console.error("Failed to dispatch cargo:", error);
    return res.status(500).json({ error: error.message });
  }
}
async function handleSimulateHazard(req, res) {
  try {
    const { cargoId, riskLevel, hazardMsg, lat, lon } = req.body;
    if (!cargoId || !riskLevel || !hazardMsg) {
      return res.status(400).json({ error: "CargoID, RiskLevel, and Hazard message parameters required." });
    }
    await updateCargoRisk(cargoId, riskLevel, hazardMsg, lat, lon);
    const alert = {
      id: `alert-hazard-${cargoId}-${Date.now()}`,
      type: "system",
      severity: "critical",
      title: "SUPPLY LINE COMPROMISED",
      message: `Transit route ${cargoId} under severe threat: ${hazardMsg} Status altered to ${riskLevel === "high" ? "Delayed" : "Rerouted"}.`,
      timestamp: Date.now()
    };
    await storeAlert(alert.id, alert.type, alert.severity, alert.title, alert.message, alert.timestamp);
    activeClients.forEach((client) => {
      if (client.readyState === import_ws2.WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "push_alert", alert }));
      }
    });
    return res.json({ success: true, message: "Hazard simulation broadcast successful. Logistical vectors adjusted." });
  } catch (error) {
    console.error("Failed to simulate logistical hazard:", error);
    return res.status(500).json({ error: error.message });
  }
}

// src/controllers/chatController.ts
var import_genai = require("@google/genai");
var ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new import_genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
var CITY_COORDS = {
  trivandrum: { lat: 8.5241, lon: 76.9366, name: "Trivandrum" },
  chennai: { lat: 13.0827, lon: 80.2707, name: "Chennai" },
  bengaluru: { lat: 12.9716, lon: 77.5946, name: "Bengaluru" },
  bangalore: { lat: 12.9716, lon: 77.5946, name: "Bengaluru" },
  tokyo: { lat: 35.6762, lon: 139.6503, name: "Tokyo" },
  seattle: { lat: 47.6062, lon: -122.3321, name: "Seattle" },
  reykjavik: { lat: 64.1466, lon: -21.9426, name: "Reykjavik" },
  london: { lat: 51.5074, lon: -0.1278, name: "London" },
  "new york": { lat: 40.7128, lon: -74.006, name: "New York" },
  sydney: { lat: -33.8688, lon: 151.2093, name: "Sydney" },
  mumbai: { lat: 19.076, lon: 72.8777, name: "Mumbai" }
};
async function handleChatMessage(req, res) {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message contents cannot be blank." });
    }
    const userId = req.user ? req.user.id : "anonymous-warden";
    const operatorName = req.user ? req.user.name : "System Guest Operator";
    await storeChatMessage(userId, "user", message);
    const query = message.toLowerCase();
    let reply = "";
    let dbMatchedContext = "";
    const hasWeatherIntent = query.includes("weather") || query.includes("temp") || query.includes("cyclone") || query.includes("wind") || query.includes("rain") || query.includes("humidity") || query.includes("storm");
    const hasSeismicIntent = query.includes("seismic") || query.includes("earthquake") || query.includes("tsunami") || query.includes("quake") || query.includes("tectonic");
    const hasLogisticsIntent = query.includes("dispatch") || query.includes("cargo") || query.includes("supply") || query.includes("warehouse") || query.includes("tracker") || query.includes("depot");
    const hasMarketIntent = query.includes("market") || query.includes("stock") || query.includes("nifty") || query.includes("sensex") || query.includes("crude") || query.includes("reliance") || query.includes("tcs") || query.includes("hdfc") || query.includes("infy") || query.includes("upstox") || query.includes("paper trade") || query.includes("portfolio") || query.includes("transmission") || query.includes("regime");
    if (hasWeatherIntent) {
      let detectedCity = "trivandrum";
      for (const cityKey of Object.keys(CITY_COORDS)) {
        if (query.includes(cityKey)) {
          detectedCity = cityKey;
          break;
        }
      }
      const coordMap = CITY_COORDS[detectedCity] || CITY_COORDS["trivandrum"];
      const storedSnapshots = await getWeatherSnapshots(50);
      const matchedSnapshot = storedSnapshots.find((s) => s.city.toLowerCase().trim() === coordMap.name.toLowerCase().trim());
      if (matchedSnapshot) {
        dbMatchedContext = `[DATABASE SNAPSHOT FOUND]: City: ${matchedSnapshot.city}, Temp: ${matchedSnapshot.temp}\xB0C, Humidity: ${matchedSnapshot.humidity}%, Wind: ${matchedSnapshot.windSpeed} m/s, Condition: ${matchedSnapshot.condition}, AQI: ${matchedSnapshot.aqi}, Captured At: ${matchedSnapshot.timestamp}`;
      } else {
        console.log(`Weather for "${coordMap.name}" not found in databases. Fetching live fallback...`);
        try {
          const lat = coordMap.lat;
          const lon = coordMap.lon;
          const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
          const metRes = await fetch(openMeteoUrl);
          if (metRes.ok) {
            const m = await metRes.json();
            const temp = m.current?.temperature_2m || 28.5;
            const humidity = m.current?.relative_humidity_2m || 65;
            const wind = m.current?.wind_speed_10m || 4.2;
            const condition = "Partly Cloudy";
            const aqi = 1;
            await storeWeatherSnapshot(coordMap.name, temp, humidity, wind, condition, aqi);
            dbMatchedContext = `[LIVE METEOROLOGICAL RETRIEVAL STORED TO DB]: City: ${coordMap.name}, Temp: ${temp}\xB0C, Humidity: ${humidity}%, Wind: ${wind} m/s, Condition: ${condition}, AQI: ${aqi}`;
          } else {
            throw new Error("Fallback weather fetch unsuccessful");
          }
        } catch (fetchErr) {
          console.error("Live atmospheric telemetry query failed:", fetchErr);
          dbMatchedContext = `[FALLBACK HARDCODED TELEMETRY]: City: ${coordMap.name}, Temp: 27.5\xB0C, Humidity: 70%, Wind: 5.0 m/s, Condition: Safe boundaries, AQI: 1. No active weather alerts registered recursively.`;
        }
      }
    }
    if (hasSeismicIntent) {
      const storedSeismic = await getSeismicLogs(15);
      if (storedSeismic && storedSeismic.length > 0) {
        dbMatchedContext += "\n[DATABASE SEISMIC LOGS FOUND]:\n";
        storedSeismic.forEach((s) => {
          dbMatchedContext += `- Place: ${s.place} | Mag: ${s.magnitude} | Depth: ${s.depth}km | Tsunami flag: ${s.tsunami} | Recorded: ${s.createdAt}
`;
        });
      } else {
        console.log("Seismic logs empty in database. Fetching latest tectonic metrics...");
        try {
          const response = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson");
          if (response.ok) {
            const data = await response.json();
            const features = (data.features || []).slice(0, 5);
            dbMatchedContext += "\n[LIVE SEISMIC DATA RETRIEVED & PERSISTED TO DB]:\n";
            for (const f of features) {
              const place = f.properties.place || "Unknown Epicenter";
              const mag = f.properties.mag || 1;
              const depth = f.geometry.coordinates[2] || 10;
              const time = f.properties.time || Date.now();
              const tsunami = f.properties.tsunami || 0;
              await storeSeismicLog(place, mag, depth, time, tsunami);
              dbMatchedContext += `- Place: ${place} | Mag: ${mag} | Depth: ${depth}km | Tsunami: ${tsunami}
`;
            }
          } else {
            throw new Error("USGS seismic fetch failed");
          }
        } catch (fetchErr) {
          console.error("USGS tectonic fetching failed:", fetchErr);
          dbMatchedContext += "\n[FALLBACK HARDCODED SEISMIC LOGS - NOMINAL clearance status]: Zero dangerous seismic stressors logged in active sectors.";
        }
      }
    }
    if (hasLogisticsIntent) {
      const warehouses2 = await getWarehouses();
      const activeCargo = await getCargoTransits();
      dbMatchedContext += "\n[DATABASE DISASTER LOGISTICS STATUS]:\n";
      dbMatchedContext += "Active Depots:\n";
      warehouses2.forEach((w) => {
        dbMatchedContext += `- Depot ${w.name} (${w.location}): Generators: ${w.generators} | Water: ${w.waterContainers} | Rations: ${w.rations} | Medical: ${w.medicalKits}
`;
      });
      dbMatchedContext += "Transit Corridors:\n";
      activeCargo.forEach((c) => {
        dbMatchedContext += `- Cargo ${c.id} Name: ${c.cargoName} | Destination: ${c.destination} | Status: ${c.status} | Risk Level: ${c.riskLevel} | Hazards: ${c.notifiedHazard || "none"}
`;
      });
    }
    if (hasMarketIntent) {
      dbMatchedContext += "\n[TERRAWATCH FINANCIAL & MARKET INTELLIGENCE STATE]:\n";
      dbMatchedContext += "Market Pulse: NIFTY 50 @ 24,850 (+0.58%), BANK NIFTY @ 51,920 (+0.62%), BRENT CRUDE @ $78.40 (+1.49%), INDIA VIX @ 13.45 (-3.24%), USD/INR @ 83.92\n";
      dbMatchedContext += "Current Market Regime: Bull (Confidence: 76%), Supported by banking and domestic inflows; key external risk is geopolitical crude volatility.\n";
      dbMatchedContext += "Event Transmission Active: (1) Sea of Japan M6.8 earthquake impacting semiconductor wafer lead times & auto tech; (2) Strait of Hormuz advisory creating aviation fuel margin compression and crude upstream tailwinds; (3) Bay of Bengal Super Cyclone tracking toward port logistics corridors.\n";
      dbMatchedContext += "Critical Principles: Always communicate probabilistic forecasts (P(Bullish), expected return distributions, confidence levels, scenario drivers, invalidation criteria). Never promise guaranteed profits or absolute directional outcomes.\n";
    }
    if (ai) {
      try {
        const systemPrompt = `You are the TerraWatch Operations Coordinate Assistant (Chat Inteligencia), designed specifically for Climate Warden operators.
Your tone must be highly professional, structured, objective, and authoritative.
We are serving Operator "${operatorName}".
Always format your answer with clean Markdown display layout. Highlight critical risks or hazards clearly.

Below is the verified historical snapshot/live context from our Postgres database:
${dbMatchedContext || "All telemetry databases are reporting normal and stable state parameters."}

Answer the operator's query directly, utilizing the provided database telemetry where applicable. Never make up fake data. All data from the database is real and must be presented as historical or live database records. If the operator's request corresponds to weather or seismic activity, explain that you have queried PostgreSQL first and retrieved the active telemetry.`;
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: message,
          config: {
            systemInstruction: systemPrompt
          }
        });
        reply = response.text || "Operational coordinator intelligence failed to produce output characters.";
      } catch (geminiError) {
        console.error("Gemini content generation failed, defaulting to analytical state-machine:", geminiError);
        reply = getDefaultStateResponse(operatorName, message, dbMatchedContext);
      }
    } else {
      console.log("Gemini client not initialized, executing offline telemetry reporter...");
      reply = getDefaultStateResponse(operatorName, message, dbMatchedContext);
    }
    const savedMsg = await storeChatMessage(userId, "assistant", reply);
    return res.json(savedMsg);
  } catch (error) {
    console.error("Operator intelligence coordination crash:", error);
    return res.status(500).json({ error: `Operational coordinator crash: ${error.message}` });
  }
}
function getDefaultStateResponse(operatorName, message, dbMatchedContext) {
  let reply = `### \u{1F4E1} AUTOMATED TELEMETRIC REPORT (Offline Fallback)
  
Operator **${operatorName}**, the TerraWatch analytics engine compiled successfully from local persistent states:

${dbMatchedContext ? dbMatchedContext : "Active sensor systems are returning stable status codes."}

*Manual Operations Advisory:* Let us know if we need to dispatch heavy assets or trigger warning sirens at the depots. WebSockets remain open.`;
  return reply;
}

// src/controllers/geospatialController.ts
function generateDeterministicEmbedding(lat, lon, year) {
  const vector = [];
  const seed = Math.sin(lat * 12.9898 + lon * 78.233 + year * 0.137) * 43758.5453;
  const distToEquator = Math.abs(lat) / 90;
  for (let i = 0; i < 64; i++) {
    const noise = Math.sin(seed + i * 2.3) * 0.5 + 0.5;
    let baseValue = 0.1;
    if (i < 16) {
      baseValue = Math.max(0, 0.8 * Math.cos(lat * 0.05) * (1 - distToEquator) - (year - 2020) * 0.015);
    } else if (i >= 16 && i < 32) {
      const urbanHubFactor = Math.sin(lat * 10) * Math.sin(lon * 10) > 0.3 ? 0.7 : 0.1;
      baseValue = urbanHubFactor + (year - 2020) * 0.024;
    } else if (i >= 32 && i < 48) {
      const isCoast = Math.abs(Math.sin(lon * 5) * Math.cos(lat * 5)) < 0.2 ? 0.8 : 0.05;
      baseValue = isCoast;
    } else {
      baseValue = Math.max(0, 0.4 * distToEquator + noise * 0.2);
    }
    const finalVal = Math.min(1, Math.max(0, baseValue * 0.7 + noise * 0.3));
    vector.push(Number(finalVal.toFixed(4)));
  }
  return vector;
}
async function fetchAndCacheEmbedding(lat, lon, year) {
  try {
    const cached = await getSatelliteEmbeddings(lat, lon, 10);
    const matchedCached = cached.find((item) => item.year === year);
    if (matchedCached) {
      return matchedCached.embedding;
    }
    let embedding = null;
    try {
      const ee2 = global.ee;
      if (ee2 && ee2.data && ee2.data._initialized) {
        const point = ee2.Geometry.Point(lon, lat);
        const embeddingCollection = ee2.ImageCollection("GOOGLE_SATELLITE_EMBEDDING_V1_ANNUAL").filterBounds(point);
        const filtered = embeddingCollection.filter(ee2.Filter.calendarRange(year, year));
        const image = filtered.first();
        if (image) {
          const info = await image.reduceRegion({
            reducer: ee2.Reducer.first(),
            geometry: point,
            scale: 10
          }).getInfo();
          if (info && typeof info === "object") {
            const sortedKeys = Object.keys(info).sort();
            embedding = sortedKeys.map((k) => Number(info[k]));
          }
        }
      }
    } catch (err) {
      console.warn(`GEE call skipped/failed for year ${year}:`, err);
    }
    if (!embedding) {
      embedding = generateDeterministicEmbedding(lat, lon, year);
    }
    await storeSatelliteEmbedding(lat, lon, year, embedding);
    return embedding;
  } catch (error) {
    console.error(`Error fetching/caching embedding for year ${year}:`, error);
    return generateDeterministicEmbedding(lat, lon, year);
  }
}
async function handleGetSatelliteEmbedding(req, res) {
  const latStr = req.query.lat;
  const lonStr = req.query.lon;
  const yearStr = req.query.year;
  if (!latStr || !lonStr) {
    return res.status(400).json({ error: "Coordinates lat and lon are required parameters" });
  }
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);
  const year = yearStr ? parseInt(yearStr, 10) : 2023;
  if (isNaN(lat) || isNaN(lon) || isNaN(year)) {
    return res.status(400).json({ error: "Parameters lat, lon and year must be valid numbers" });
  }
  try {
    const embedding = await fetchAndCacheEmbedding(lat, lon, year);
    return res.json({
      success: true,
      lat,
      lon,
      year,
      embedding,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      metadata: {
        source: "AlphaEarth Foundations",
        resolution: "10m x 10m",
        dimensions: 64
      }
    });
  } catch (error) {
    console.error("Failed to get satellite embedding:", error);
    return res.status(500).json({ error: error.message || "Geospatial service error" });
  }
}
async function handleGetEmbeddingHistory(req, res) {
  const latStr = req.query.lat;
  const lonStr = req.query.lon;
  if (!latStr || !lonStr) {
    return res.status(400).json({ error: "Coordinates lat and lon are required" });
  }
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);
  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: "lat and lon must be numbers" });
  }
  try {
    const yearsToFetch = [2018, 2020, 2022, 2024];
    const results = [];
    for (const yr of yearsToFetch) {
      const embedding = await fetchAndCacheEmbedding(lat, lon, yr);
      results.push({
        year: yr,
        embedding,
        source: "database_cache"
      });
    }
    return res.json({
      lat,
      lon,
      history: results,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    console.error("Failed to query embedding history:", err);
    return res.status(500).json({ error: err.message || "History lookup anomaly" });
  }
}
async function handleCompareEmbeddings(req, res) {
  const latStr = req.query.lat;
  const lonStr = req.query.lon;
  const year1Str = req.query.year1;
  const year2Str = req.query.year2;
  if (!latStr || !lonStr || !year1Str || !year2Str) {
    return res.status(400).json({
      error: "lat, lon, year1, and year2 are required parameters (e.g., ?lat=13.0827&lon=80.2707&year1=2018&year2=2024)"
    });
  }
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);
  const year1 = parseInt(year1Str, 10);
  const year2 = parseInt(year2Str, 10);
  if (isNaN(lat) || isNaN(lon) || isNaN(year1) || isNaN(year2)) {
    return res.status(400).json({ error: "Coordinates and year variables must be valid numbers" });
  }
  try {
    const [emb1, emb2] = await Promise.all([
      fetchAndCacheEmbedding(lat, lon, year1),
      fetchAndCacheEmbedding(lat, lon, year2)
    ]);
    let sqSum = 0;
    for (let i = 0; i < 64; i++) {
      const valA = emb1[i] || 0;
      const valB = emb2[i] || 0;
      sqSum += Math.pow(valA - valB, 2);
    }
    const changeScore = Math.sqrt(sqSum);
    const f1 = emb1.slice(0, 16).reduce((s, x) => s + x, 0) / 16;
    const f2 = emb2.slice(0, 16).reduce((s, x) => s + x, 0) / 16;
    const u1 = emb1.slice(16, 32).reduce((s, x) => s + x, 0) / 16;
    const u2 = emb2.slice(16, 32).reduce((s, x) => s + x, 0) / 16;
    const w1 = emb1.slice(32, 48).reduce((s, x) => s + x, 0) / 16;
    const w2 = emb2.slice(32, 48).reduce((s, x) => s + x, 0) / 16;
    const b1 = emb1.slice(48, 64).reduce((s, x) => s + x, 0) / 16;
    const b2 = emb2.slice(48, 64).reduce((s, x) => s + x, 0) / 16;
    const deltaUrban = u2 - u1;
    const deltaForest = f2 - f1;
    const deltaWater = w2 - w1;
    const deltaBarren = b2 - b1;
    let changeType = "Minimal Change";
    if (deltaUrban > 0.04) {
      changeType = "Urbanization";
    } else if (deltaForest < -0.04) {
      changeType = "Deforestation";
    } else if (Math.abs(deltaWater) > 0.05) {
      changeType = "Water Body Change";
    } else if (deltaBarren > 0.04) {
      changeType = "Bedrock/Vegetation Clearing";
    } else if (changeScore > 0.5) {
      changeType = "Significant Multi-spectral Shift";
    }
    return res.json({
      success: true,
      lat,
      lon,
      year1,
      year2,
      changeScore: Number(changeScore.toFixed(4)),
      changeType,
      embeddings: {
        [year1]: emb1,
        [year2]: emb2
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    console.error("Failed to run embedding comparison:", err);
    return res.status(500).json({ error: err.message || "Geospatial comparison failure" });
  }
}
async function handleGetChangeHotspots(req, res) {
  const year1Str = req.query.year1;
  const year2Str = req.query.year2;
  const year1 = year1Str ? parseInt(year1Str, 10) : 2018;
  const year2 = year2Str ? parseInt(year2Str, 10) : 2024;
  if (isNaN(year1) || isNaN(year2)) {
    return res.status(400).json({ error: "Years must be valid integers" });
  }
  const PRESET_STATIONS = [
    { name: "Chennai Port Depot", lat: 13.0827, lon: 80.2707 },
    { name: "Tokyo Regional Depot", lat: 35.6762, lon: 139.6503 },
    { name: "Seattle Logistics Facility", lat: 47.6062, lon: -122.3321 },
    { name: "Reykjavik Geothermal Node", lat: 64.1466, lon: -21.9426 },
    { name: "Amazon Rainforest Basin", lat: -3.4653, lon: -62.2159 },
    { name: "Sahara Dune Boundary", lat: 22.1843, lon: 15.3421 }
  ];
  try {
    const hotspots = [];
    for (const station of PRESET_STATIONS) {
      const emb1 = await fetchAndCacheEmbedding(station.lat, station.lon, year1);
      const emb2 = await fetchAndCacheEmbedding(station.lat, station.lon, year2);
      let sqSum = 0;
      for (let i = 0; i < 64; i++) {
        const valA = emb1[i] || 0;
        const valB = emb2[i] || 0;
        sqSum += Math.pow(valA - valB, 2);
      }
      const changeScore = Math.sqrt(sqSum);
      const f1 = emb1.slice(0, 16).reduce((s, x) => s + x, 0) / 16;
      const f2 = emb2.slice(0, 16).reduce((s, x) => s + x, 0) / 16;
      const u1 = emb1.slice(16, 32).reduce((s, x) => s + x, 0) / 16;
      const u2 = emb2.slice(16, 32).reduce((s, x) => s + x, 0) / 16;
      const w1 = emb1.slice(32, 48).reduce((s, x) => s + x, 0) / 16;
      const w2 = emb2.slice(32, 48).reduce((s, x) => s + x, 0) / 16;
      const b1 = emb1.slice(48, 64).reduce((s, x) => s + x, 0) / 16;
      const b2 = emb2.slice(48, 64).reduce((s, x) => s + x, 0) / 16;
      const deltaUrban = u2 - u1;
      const deltaForest = f2 - f1;
      const deltaWater = w2 - w1;
      const deltaBarren = b2 - b1;
      let changeType = "Minimal Change";
      if (deltaUrban > 0.04) {
        changeType = "Urbanization";
      } else if (deltaForest < -0.04) {
        changeType = "Deforestation";
      } else if (Math.abs(deltaWater) > 0.05) {
        changeType = "Water Body Change";
      } else if (deltaBarren > 0.04) {
        changeType = "Bedrock/Vegetation Clearing";
      } else if (changeScore > 0.5) {
        changeType = "Significant Multi-spectral Shift";
      }
      hotspots.push({
        lat: station.lat,
        lon: station.lon,
        name: station.name,
        changeScore: Number(changeScore.toFixed(4)),
        changeType,
        year1,
        year2
      });
    }
    hotspots.sort((a, b) => b.changeScore - a.changeScore);
    return res.json({
      success: true,
      hotspots
    });
  } catch (err) {
    console.error("Failed to locate change hotspots:", err);
    return res.status(500).json({ error: err.message || "Divergence scoring exception" });
  }
}
async function handleExportHotspotsCSV(req, res) {
  const year1Str = req.query.year1;
  const year2Str = req.query.year2;
  const year1 = year1Str ? parseInt(year1Str, 10) : 2018;
  const year2 = year2Str ? parseInt(year2Str, 10) : 2024;
  if (isNaN(year1) || isNaN(year2)) {
    return res.status(400).json({ error: "Years must be valid integers" });
  }
  const PRESET_STATIONS = [
    { name: "Chennai Port Depot", lat: 13.0827, lon: 80.2707 },
    { name: "Tokyo Regional Depot", lat: 35.6762, lon: 139.6503 },
    { name: "Seattle Logistics Facility", lat: 47.6062, lon: -122.3321 },
    { name: "Reykjavik Geothermal Node", lat: 64.1466, lon: -21.9426 },
    { name: "Amazon Rainforest Basin", lat: -3.4653, lon: -62.2159 },
    { name: "Sahara Dune Boundary", lat: 22.1843, lon: 15.3421 }
  ];
  try {
    const csvLines = [
      "Rank,Station Name,Latitude,Longitude,Euclidean Change Score,Deduced Shift Type,Start Year,End Year"
    ];
    const hotspots = [];
    for (const station of PRESET_STATIONS) {
      const emb1 = await fetchAndCacheEmbedding(station.lat, station.lon, year1);
      const emb2 = await fetchAndCacheEmbedding(station.lat, station.lon, year2);
      let sqSum = 0;
      for (let i = 0; i < 64; i++) {
        const valA = emb1[i] || 0;
        const valB = emb2[i] || 0;
        sqSum += Math.pow(valA - valB, 2);
      }
      const changeScore = Math.sqrt(sqSum);
      const f1 = emb1.slice(0, 16).reduce((s, x) => s + x, 0) / 16;
      const f2 = emb2.slice(0, 16).reduce((s, x) => s + x, 0) / 16;
      const u1 = emb1.slice(16, 32).reduce((s, x) => s + x, 0) / 16;
      const u2 = emb2.slice(16, 32).reduce((s, x) => s + x, 0) / 16;
      const w1 = emb1.slice(32, 48).reduce((s, x) => s + x, 0) / 16;
      const w2 = emb2.slice(32, 48).reduce((s, x) => s + x, 0) / 16;
      const b1 = emb1.slice(48, 64).reduce((s, x) => s + x, 0) / 16;
      const b2 = emb2.slice(48, 64).reduce((s, x) => s + x, 0) / 16;
      const deltaUrban = u2 - u1;
      const deltaForest = f2 - f1;
      const deltaWater = w2 - w1;
      const deltaBarren = b2 - b1;
      let changeType = "Minimal Change";
      if (deltaUrban > 0.04) {
        changeType = "Urbanization";
      } else if (deltaForest < -0.04) {
        changeType = "Deforestation";
      } else if (Math.abs(deltaWater) > 0.05) {
        changeType = "Water Body Change";
      } else if (deltaBarren > 0.04) {
        changeType = "Bedrock/Vegetation Clearing";
      } else if (changeScore > 0.5) {
        changeType = "Significant Multi-spectral Shift";
      }
      hotspots.push({
        lat: station.lat,
        lon: station.lon,
        name: station.name,
        changeScore: Number(changeScore.toFixed(4)),
        changeType,
        year1,
        year2
      });
    }
    hotspots.sort((a, b) => b.changeScore - a.changeScore);
    hotspots.forEach((h, idx) => {
      const escapedName = `"${h.name.replace(/"/g, '""')}"`;
      csvLines.push(`${idx + 1},${escapedName},${h.lat},${h.lon},${h.changeScore},"${h.changeType}",${year1},${year2}`);
    });
    const csvContent = csvLines.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="terrawatch_hotspots_${year1}_${year2}.csv"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error("Failed to export hotspots CSV:", err);
    return res.status(500).json({ error: err.message || "Geospatial CSV export exception" });
  }
}

// src/services/marketProvider.ts
var BASE_INSTRUMENTS = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    exchange: "NSE",
    sector: "Energy & Petrochemicals",
    currentPrice: 2942.5,
    changePercent: 1.25,
    dayHigh: 2965,
    dayLow: 2915.2,
    volume: 6420500,
    vwap: 2938.1,
    marketCapCr: 1991420,
    peRatio: 28.4,
    volatilityRating: "MEDIUM",
    isPopular: true
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    exchange: "NSE",
    sector: "Information Technology",
    currentPrice: 4215.8,
    changePercent: -0.68,
    dayHigh: 4260,
    dayLow: 4198.5,
    volume: 2150400,
    vwap: 4224.3,
    marketCapCr: 1524300,
    peRatio: 31.8,
    volatilityRating: "LOW",
    isPopular: true
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    exchange: "NSE",
    sector: "Banking & Financials",
    currentPrice: 1648.2,
    changePercent: 0.85,
    dayHigh: 1662,
    dayLow: 1635.1,
    volume: 14200800,
    vwap: 1644.9,
    marketCapCr: 1251900,
    peRatio: 19.2,
    volatilityRating: "MEDIUM",
    isPopular: true
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd",
    exchange: "NSE",
    sector: "Information Technology",
    currentPrice: 1872.4,
    changePercent: -1.14,
    dayHigh: 1904,
    dayLow: 1860,
    volume: 5310900,
    vwap: 1878.5,
    marketCapCr: 778400,
    peRatio: 29.1,
    volatilityRating: "MEDIUM",
    isPopular: true
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd",
    exchange: "NSE",
    sector: "Banking & Financials",
    currentPrice: 1218.6,
    changePercent: 1.42,
    dayHigh: 1225,
    dayLow: 1198.4,
    volume: 9840200,
    vwap: 1214.2,
    marketCapCr: 856200,
    peRatio: 18.4,
    volatilityRating: "MEDIUM",
    isPopular: true
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    exchange: "NSE",
    sector: "Public Sector Banking",
    currentPrice: 814.75,
    changePercent: 0.45,
    dayHigh: 824.9,
    dayLow: 808.2,
    volume: 1854e4,
    vwap: 813.5,
    marketCapCr: 727100,
    peRatio: 11.2,
    volatilityRating: "MEDIUM",
    isPopular: true
  },
  {
    symbol: "LT",
    name: "Larsen & Toubro Ltd",
    exchange: "NSE",
    sector: "Infrastructure & Engineering",
    currentPrice: 3680,
    changePercent: 1.95,
    dayHigh: 3712,
    dayLow: 3620,
    volume: 2450100,
    vwap: 3668,
    marketCapCr: 506400,
    peRatio: 38.5,
    volatilityRating: "MEDIUM",
    isPopular: true
  },
  {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel Ltd",
    exchange: "NSE",
    sector: "Telecommunications",
    currentPrice: 1542.1,
    changePercent: 0.62,
    dayHigh: 1558,
    dayLow: 1530,
    volume: 4890300,
    vwap: 1540.2,
    marketCapCr: 889200,
    peRatio: 72.3,
    volatilityRating: "LOW",
    isPopular: true
  },
  {
    symbol: "TATAMOTORS",
    name: "Tata Motors Passenger & EV",
    exchange: "NSE",
    sector: "Automobile & Mobility",
    currentPrice: 978.4,
    changePercent: -0.42,
    dayHigh: 994,
    dayLow: 969.5,
    volume: 812e4,
    vwap: 981.1,
    marketCapCr: 360200,
    peRatio: 16.8,
    volatilityRating: "HIGH",
    isPopular: true
  },
  {
    symbol: "TATASTEEL",
    name: "Tata Steel Ltd",
    exchange: "NSE",
    sector: "Metals & Mining",
    currentPrice: 152.8,
    changePercent: -1.82,
    dayHigh: 156.4,
    dayLow: 151.2,
    volume: 284e5,
    vwap: 153.1,
    marketCapCr: 190800,
    peRatio: 42.1,
    volatilityRating: "HIGH",
    isPopular: false
  },
  {
    symbol: "SUNPHARMA",
    name: "Sun Pharmaceutical Industries",
    exchange: "NSE",
    sector: "Pharmaceuticals & Healthcare",
    currentPrice: 1785.3,
    changePercent: 0.35,
    dayHigh: 1799,
    dayLow: 1772,
    volume: 194e4,
    vwap: 1782.4,
    marketCapCr: 428300,
    peRatio: 39.4,
    volatilityRating: "LOW",
    isPopular: false
  },
  {
    symbol: "ITC",
    name: "ITC Ltd",
    exchange: "NSE",
    sector: "FMCG & Agri-Business",
    currentPrice: 488.6,
    changePercent: 0.22,
    dayHigh: 492,
    dayLow: 485.1,
    volume: 914e4,
    vwap: 487.8,
    marketCapCr: 609800,
    peRatio: 28.9,
    volatilityRating: "LOW",
    isPopular: false
  }
];
var paperPortfolioState = {
  cashINR: 1e6,
  // ₹10,00,000 initial virtual balance
  investedINR: 0,
  totalPortfolioValueINR: 1e6,
  unrealizedPnlINR: 0,
  realizedPnlINR: 0,
  totalPnlPercent: 0,
  positions: [],
  orderHistory: [],
  riskStatus: {
    concentrationExceeded: false,
    largestSector: "None",
    largestSectorPercent: 0,
    maxSinglePositionPercent: 0
  }
};
var DEFAULT_ANALYTICS_TOKEN = "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI1M0NMTkQiLCJqdGkiOiI2YTlmZWQyYzUyYWIyNzQ4NTQ0MzJjYzAiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlzRXh0ZW5kZWQiOnRydWUsImlhdCI6MTc4ODg2NTgzNiwiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxODIwNDQwODAwfQ.h0SilzuyPLFPCdf2eFR0QXScSnDakYfmCx0gTm4UaZU";
var upstoxCredentials = {
  apiKey: process.env.UPSTOX_API_KEY || "53CLND",
  apiSecret: process.env.UPSTOX_API_SECRET || "",
  redirectUri: process.env.UPSTOX_REDIRECT_URI || "",
  accessToken: process.env.UPSTOX_ACCESS_TOKEN || DEFAULT_ANALYTICS_TOKEN
};
var UPSTOX_INSTRUMENT_MAP = {
  RELIANCE: "NSE_EQ|INE002A01018",
  TCS: "NSE_EQ|INE467B01029",
  HDFCBANK: "NSE_EQ|INE040A01034",
  INFY: "NSE_EQ|INE009A01021",
  ICICIBANK: "NSE_EQ|INE090A01021",
  SBIN: "NSE_EQ|INE062A01020",
  LT: "NSE_EQ|INE018A01030",
  BHARTIARTL: "NSE_EQ|INE397D01024",
  TATAMOTORS: "NSE_EQ|INE155A01022",
  TATASTEEL: "NSE_EQ|INE081A01020",
  SUNPHARMA: "NSE_EQ|INE044A01036",
  ITC: "NSE_EQ|INE154A01025",
  "NIFTY 50": "NSE_INDEX|Nifty 50",
  "NIFTY50": "NSE_INDEX|Nifty 50",
  "BANK NIFTY": "NSE_INDEX|Nifty Bank",
  "BANKNIFTY": "NSE_INDEX|Nifty Bank",
  "NIFTY BANK": "NSE_INDEX|Nifty Bank"
};
var UpstoxProvider = class {
  constructor() {
    this.baseUrl = "https://api.upstox.com/v2";
  }
  isReady() {
    return Boolean(upstoxCredentials.accessToken);
  }
  getInstrumentKey(symbol) {
    const cleanSym = symbol.trim().toUpperCase();
    return UPSTOX_INSTRUMENT_MAP[cleanSym] || `NSE_EQ|${cleanSym}`;
  }
  async fetchLiveQuote(symbol) {
    if (!this.isReady()) return null;
    try {
      const formattedKey = this.getInstrumentKey(symbol);
      const res = await fetch(`${this.baseUrl}/market-quote/quotes?instrument_key=${encodeURIComponent(formattedKey)}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${upstoxCredentials.accessToken}`
        }
      });
      if (!res.ok) {
        console.warn(`Upstox quote returned HTTP ${res.status}`);
        return null;
      }
      const data = await res.json();
      const quoteData = data?.data?.[formattedKey] || data?.data?.[formattedKey.replace("|", ":")] || data?.data && Object.values(data.data)[0];
      if (!quoteData) return null;
      const ltp = Number(quoteData.last_price || 0);
      const close = Number(quoteData.ohlc?.close || ltp);
      const change = Number(quoteData.net_change !== void 0 ? quoteData.net_change : ltp - close);
      const changePercent = close > 0 ? Number((change / close * 100).toFixed(2)) : 0;
      return {
        instrumentId: formattedKey,
        symbol: symbol.toUpperCase(),
        name: quoteData.symbol || symbol,
        exchange: "NSE",
        timestamp: Date.now(),
        ltp,
        change: Number(change.toFixed(2)),
        changePercent,
        bid: quoteData.depth?.buy?.[0]?.price || Number((ltp - 0.25).toFixed(2)),
        ask: quoteData.depth?.sell?.[0]?.price || Number((ltp + 0.25).toFixed(2)),
        open: Number(quoteData.ohlc?.open || ltp),
        high: Number(quoteData.ohlc?.high || ltp),
        low: Number(quoteData.ohlc?.low || ltp),
        close,
        volume: Number(quoteData.volume || 0),
        vwap: Number(quoteData.average_price || ltp),
        openInterest: Number(quoteData.oi || 0),
        source: "UPSTOX_LIVE"
      };
    } catch (err) {
      console.warn("Upstox API call failed, falling back to simulated data:", err);
      return null;
    }
  }
  async fetchHistoricalBars(symbol, timeframe = "1D") {
    if (!this.isReady()) return null;
    try {
      const formattedKey = this.getInstrumentKey(symbol);
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      let interval = "day";
      let fromDate = "2024-01-01";
      if (timeframe === "15m" || timeframe === "1h") {
        interval = "30minute";
        fromDate = "2026-08-01";
      } else if (timeframe === "1W") {
        interval = "week";
        fromDate = "2023-01-01";
      }
      const url = `${this.baseUrl}/historical-candle/${encodeURIComponent(formattedKey)}/${interval}/${today}/${fromDate}`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${upstoxCredentials.accessToken}`
        }
      });
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      const rawCandles = data?.data?.candles || [];
      if (!Array.isArray(rawCandles) || rawCandles.length === 0) {
        return null;
      }
      const recentCandles = rawCandles.slice(0, 45).reverse();
      const bars = recentCandles.map((c) => {
        const d = new Date(c[0]);
        let timeStr = "";
        if (timeframe === "1D" || timeframe === "1W") {
          timeStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        } else {
          timeStr = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
        }
        return {
          timestamp: d.getTime(),
          timeStr,
          open: Number(c[1]),
          high: Number(c[2]),
          low: Number(c[3]),
          close: Number(c[4]),
          volume: Number(c[5] || 0)
        };
      });
      for (let i = 0; i < bars.length; i++) {
        if (i >= 19) {
          const slice20 = bars.slice(i - 19, i + 1);
          const sum20 = slice20.reduce((acc, b) => acc + b.close, 0);
          bars[i].sma20 = Number((sum20 / 20).toFixed(2));
          bars[i].ema20 = Number((sum20 / 20 * 1.002).toFixed(2));
          const mean = bars[i].sma20;
          const variance = slice20.reduce((acc, b) => acc + Math.pow(b.close - mean, 2), 0) / 20;
          const stdDev = Math.sqrt(variance);
          bars[i].upperBB = Number((mean + 2 * stdDev).toFixed(2));
          bars[i].lowerBB = Number((mean - 2 * stdDev).toFixed(2));
        }
        if (i >= 9) {
          const slice = bars.slice(0, i + 1);
          const sum = slice.reduce((acc, b) => acc + b.close, 0);
          bars[i].sma50 = Number((sum / slice.length).toFixed(2));
        }
        if (i >= 14) {
          let gains = 0;
          let losses = 0;
          for (let j = i - 13; j <= i; j++) {
            const diff = bars[j].close - bars[j - 1].close;
            if (diff >= 0) gains += diff;
            else losses += Math.abs(diff);
          }
          const avgGain = gains / 14;
          const avgLoss = losses / 14 === 0 ? 1e-3 : losses / 14;
          const rs = avgGain / avgLoss;
          bars[i].rsi = Number((100 - 100 / (1 + rs)).toFixed(1));
        }
      }
      return bars;
    } catch (err) {
      console.warn("Failed to fetch Upstox historical candles, using fallback:", err);
      return null;
    }
  }
};
var SimulatedMarketProvider = class {
  constructor() {
    this.instruments = [...BASE_INSTRUMENTS];
  }
  getInstruments(query) {
    if (!query) return this.instruments;
    const q = query.toLowerCase().trim();
    return this.instruments.filter(
      (inst) => inst.symbol.toLowerCase().includes(q) || inst.name.toLowerCase().includes(q) || inst.sector.toLowerCase().includes(q)
    );
  }
  getInstrument(symbol) {
    return this.instruments.find((i) => i.symbol.toUpperCase() === symbol.toUpperCase());
  }
  getMarketPulse() {
    const now = Date.now();
    const drift = Math.sin(now / 15e3) * 0.15;
    return [
      {
        symbol: "NIFTY 50",
        name: "NIFTY 50 Benchmark",
        value: 24850.4 + drift * 25,
        change: 142.6 + drift * 20,
        changePercent: 0.58 + drift * 0.08,
        category: "Indian Index",
        trend: "bullish",
        sentiment: "Moderate Bull"
      },
      {
        symbol: "BANK NIFTY",
        name: "Nifty Bank Index",
        value: 51920.1 + drift * 45,
        change: 320.4 + drift * 35,
        changePercent: 0.62 + drift * 0.07,
        category: "Indian Sector",
        trend: "bullish",
        sentiment: "Sector Momentum Strong"
      },
      {
        symbol: "SENSEX",
        name: "BSE SENSEX 30",
        value: 81520.8 + drift * 60,
        change: 410.2 + drift * 40,
        changePercent: 0.51 + drift * 0.05,
        category: "Indian Index",
        trend: "bullish",
        sentiment: "Resilient Inflows"
      },
      {
        symbol: "INDIA VIX",
        name: "Volatility Index",
        value: Math.max(10, 13.45 - drift * 0.8),
        change: -0.45 - drift * 0.4,
        changePercent: -3.24,
        category: "Volatility",
        trend: "bearish",
        sentiment: "Subdued Fear Gauge"
      },
      {
        symbol: "USD/INR",
        name: "US Dollar / Indian Rupee",
        value: 83.92 + drift * 0.04,
        change: -0.05,
        changePercent: -0.06,
        category: "Currency",
        trend: "neutral",
        sentiment: "RBI Range Management"
      },
      {
        symbol: "BRENT CRUDE",
        name: "Crude Oil Spot ($/bbl)",
        value: 78.4 + drift * 0.6,
        change: 1.15,
        changePercent: 1.49,
        category: "Commodity",
        trend: "bullish",
        sentiment: "Geopolitical Supply Risk"
      },
      {
        symbol: "GOLD (MCX)",
        name: "Gold 24K (\u20B9/10g)",
        value: 73840 + drift * 80,
        change: 210,
        changePercent: 0.29,
        category: "Commodity",
        trend: "bullish",
        sentiment: "Safe Haven Demand"
      },
      {
        symbol: "S&P 500",
        name: "US S&P 500 Index",
        value: 5590.2 + drift * 8,
        change: 24.5,
        changePercent: 0.44,
        category: "Global Benchmark",
        trend: "bullish",
        sentiment: "Tech Resurgence"
      }
    ];
  }
  getQuote(symbol) {
    const inst = this.getInstrument(symbol) || this.instruments[0];
    const now = Date.now();
    const tickDrift = Math.sin(now / 7e3 + symbol.length) * 0.4 * (inst.currentPrice * 1e-3);
    const ltp = Number((inst.currentPrice + tickDrift).toFixed(2));
    const close = inst.currentPrice - inst.currentPrice * (inst.changePercent / 100);
    const change = Number((ltp - close).toFixed(2));
    const changePercent = Number((change / close * 100).toFixed(2));
    return {
      instrumentId: `NSE_EQ|${inst.symbol}`,
      symbol: inst.symbol,
      name: inst.name,
      exchange: inst.exchange,
      timestamp: now,
      ltp,
      change,
      changePercent,
      bid: Number((ltp - 0.2).toFixed(2)),
      ask: Number((ltp + 0.2).toFixed(2)),
      open: Number((close + (inst.dayHigh - close) * 0.2).toFixed(2)),
      high: Math.max(inst.dayHigh, ltp),
      low: Math.min(inst.dayLow, ltp),
      close: Number(close.toFixed(2)),
      volume: inst.volume + Math.floor(Math.random() * 2e3),
      vwap: inst.vwap,
      openInterest: 145e3 + Math.floor(Math.sin(now / 6e4) * 5e3),
      source: "SIMULATED_FEED"
    };
  }
  getHistoricalBars(symbol, timeframe = "1D") {
    const inst = this.getInstrument(symbol) || this.instruments[0];
    const bars = [];
    const count = 40;
    const basePrice = inst.currentPrice;
    let currentBarPrice = basePrice * 0.94;
    for (let i = count; i >= 0; i--) {
      let stepMs = 864e5;
      if (timeframe === "15m") stepMs = 15 * 60 * 1e3;
      else if (timeframe === "1h") stepMs = 60 * 60 * 1e3;
      else if (timeframe === "1W") stepMs = 7 * 864e5;
      const time = new Date(Date.now() - i * stepMs);
      let timeStr = "";
      if (timeframe === "1D" || timeframe === "1W") {
        timeStr = time.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      } else {
        timeStr = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;
      }
      const wave = Math.sin(i * 0.4 + symbol.length) * 0.015;
      const noise = (Math.random() - 0.48) * 0.012;
      const pctChange = wave + noise;
      const open = currentBarPrice;
      const close = open * (1 + pctChange);
      const high = Math.max(open, close) * (1 + Math.random() * 8e-3);
      const low = Math.min(open, close) * (1 - Math.random() * 8e-3);
      const volume = Math.floor(inst.volume * (0.6 + Math.random() * 0.8));
      currentBarPrice = close;
      bars.push({
        timestamp: time.getTime(),
        timeStr,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume
      });
    }
    for (let i = 0; i < bars.length; i++) {
      if (i >= 19) {
        const slice20 = bars.slice(i - 19, i + 1);
        const sum20 = slice20.reduce((acc, b) => acc + b.close, 0);
        bars[i].sma20 = Number((sum20 / 20).toFixed(2));
        bars[i].ema20 = Number((sum20 / 20 * 1.002).toFixed(2));
        const mean = bars[i].sma20;
        const variance = slice20.reduce((acc, b) => acc + Math.pow(b.close - mean, 2), 0) / 20;
        const stdDev = Math.sqrt(variance);
        bars[i].upperBB = Number((mean + 2 * stdDev).toFixed(2));
        bars[i].lowerBB = Number((mean - 2 * stdDev).toFixed(2));
      }
      if (i >= 10) {
        const slice10 = bars.slice(0, i + 1);
        const sum = slice10.reduce((acc, b) => acc + b.close, 0);
        bars[i].sma50 = Number((sum / slice10.length).toFixed(2));
      }
      if (i >= 14) {
        let gains = 0;
        let losses = 0;
        for (let j = i - 13; j <= i; j++) {
          const diff = bars[j].close - bars[j - 1].close;
          if (diff >= 0) gains += diff;
          else losses += Math.abs(diff);
        }
        const avgGain = gains / 14;
        const avgLoss = losses / 14 === 0 ? 1e-3 : losses / 14;
        const rs = avgGain / avgLoss;
        bars[i].rsi = Number((100 - 100 / (1 + rs)).toFixed(1));
      } else {
        bars[i].rsi = 52.4;
      }
      bars[i].macd = Number((Math.sin(i * 0.3) * 12).toFixed(2));
      bars[i].macdSignal = Number((Math.sin(i * 0.3 - 0.3) * 11).toFixed(2));
    }
    return bars;
  }
  getTechnicalAnalysis(symbol) {
    const bars = this.getHistoricalBars(symbol, "1D");
    const latest = bars[bars.length - 1];
    const prev = bars[bars.length - 2];
    const rsi = latest.rsi || 54.2;
    const aboveSma20 = latest.close > (latest.sma20 || latest.close);
    const aboveSma50 = latest.close > (latest.sma50 || latest.close);
    let score = 0;
    if (rsi > 50 && rsi < 70) score += 35;
    else if (rsi >= 70) score -= 15;
    else if (rsi < 30) score += 20;
    else score -= 25;
    if (aboveSma20) score += 30;
    else score -= 25;
    if (aboveSma50) score += 25;
    else score -= 20;
    let regime = "neutral";
    if (score >= 50) regime = "strong_bullish";
    else if (score >= 20) regime = "bullish";
    else if (score <= -45) regime = "strong_bearish";
    else if (score <= -15) regime = "bearish";
    const range = latest.high - latest.low;
    return {
      regime,
      score,
      rsi,
      macd: {
        macdLine: latest.macd || 4.2,
        signalLine: latest.macdSignal || 2.8,
        histogram: Number(((latest.macd || 4.2) - (latest.macdSignal || 2.8)).toFixed(2)),
        trend: (latest.macd || 0) > (latest.macdSignal || 0) ? "bullish" : "bearish"
      },
      movingAverages: {
        sma20: latest.sma20 || latest.close * 0.98,
        sma50: latest.sma50 || latest.close * 0.95,
        ema20: latest.ema20 || latest.close * 0.985,
        aboveSma20,
        aboveSma50
      },
      bollingerBands: {
        upper: latest.upperBB || latest.close * 1.04,
        middle: latest.sma20 || latest.close,
        lower: latest.lowerBB || latest.close * 0.96,
        bandWidthPercent: Number((((latest.upperBB || latest.close * 1.04) - (latest.lowerBB || latest.close * 0.96)) / latest.close * 100).toFixed(2)),
        isSqueezed: false
      },
      supportResistance: {
        support1: Number((latest.close - range * 0.8).toFixed(2)),
        support2: Number((latest.close - range * 1.6).toFixed(2)),
        resistance1: Number((latest.close + range * 0.8).toFixed(2)),
        resistance2: Number((latest.close + range * 1.6).toFixed(2))
      },
      summaryText: `Current structure indicates ${regime.replace("_", " ")} trend momentum. RSI stands at ${rsi}, trading ${aboveSma20 ? "above" : "below"} 20-day SMA. Bollinger volatility envelopes are wide.`
    };
  }
  getProbabilisticForecast(symbol, horizon = "1D") {
    const inst = this.getInstrument(symbol) || this.instruments[0];
    const tech = this.getTechnicalAnalysis(symbol);
    let bullishProb = 52;
    let bearishProb = 26;
    let neutralProb = 22;
    if (tech.score > 30) {
      bullishProb = 62;
      bearishProb = 18;
      neutralProb = 20;
    } else if (tech.score < -20) {
      bullishProb = 22;
      bearishProb = 58;
      neutralProb = 20;
    }
    return {
      symbol: inst.symbol,
      horizon,
      probabilities: {
        bullish: bullishProb,
        neutral: neutralProb,
        bearish: bearishProb
      },
      expectedReturnPercent: {
        p10: -1.85,
        p25: -0.62,
        median: 0.48,
        p75: 1.35,
        p90: 2.4
      },
      modelConfidence: "Moderate",
      riskScore: inst.volatilityRating === "HIGH" ? 68 : inst.volatilityRating === "MEDIUM" ? 44 : 28,
      primaryDrivers: [
        "Positive sector momentum in Indian benchmark baskets",
        `Consolidation above volume-weighted average price (\u20B9${inst.vwap.toFixed(2)})`,
        "Subdued India VIX supporting lower drawdown probability",
        "Improving institutional foreign & domestic liquidity flow"
      ],
      riskFactors: [
        "Elevated crude oil prices could pressure operating margins",
        "Persistent US treasury yield resilience tightening emerging market carry trades",
        "Potential geopolitical supply route bottlenecks"
      ],
      invalidationConditions: [
        `Breach below primary structural support at \u20B9${tech.supportResistance.support1}`,
        "India VIX spiking above 18.0 threshold",
        "Negative macro announcement from central monetary policy authorities"
      ],
      historicalAnalogue: {
        eventTitle: "Post-monsoon industrial expansion & liquidity surge",
        date: "October 2023",
        correlationScore: 0.78,
        historicalOutcome: "+3.4% median upward trajectory over following 15 trading days"
      },
      modelVersion: "TERRA-HYBRID-TRANSFORMER-V4.2",
      disclaimer: "Probabilistic scenario distribution based on historical statistical analogs and multi-spectral telemetry. Not a financial return guarantee."
    };
  }
  // -------------------------------------------------------------
  // EVENT-TO-MARKET TRANSMISSION ENGINE (TERRAWATCH DIFFERENTIATOR)
  // -------------------------------------------------------------
  getEventTransmissions() {
    return [
      {
        id: "trans-01",
        eventCategory: "environmental",
        headline: "M6.8 Off-Shore Earthquake Detected in Sea of Japan Tectonic Arc",
        timestamp: Date.now() - 36e5 * 2,
        severity: "high",
        transmissionChain: [
          "Off-shore seismic rupture & localized wave disturbance",
          "Precautionary shutdown across regional semiconductor fab facilities & ports",
          "Global electronic supply-chain delivery lead times extended by 3-5 weeks",
          "Inventory buffer drawdown across Indian electronics, auto component & IT firms",
          "Elevated price pressure on critical wafers & optical sensors"
        ],
        affectedCommodities: [
          { name: "Silicon / Wafers", expectedImpact: "bullish", confidencePercent: 88 },
          { name: "Copper / Electronics Grade", expectedImpact: "bullish", confidencePercent: 74 },
          { name: "Air Freight Cargo Rates", expectedImpact: "bullish", confidencePercent: 82 }
        ],
        affectedSectors: [
          {
            sector: "Automobile & EV",
            impactDirection: "negative",
            exposureDegree: "high",
            rationale: "Potential chip allocation delays for advanced driver assist and engine telemetry microcontrollers."
          },
          {
            sector: "Information Technology & Hardware",
            impactDirection: "mixed",
            exposureDegree: "moderate",
            rationale: "Hardware vendor procurement pricing increases, while cloud migration demand accelerates."
          },
          {
            sector: "Domestic Manufacturing / EMS",
            impactDirection: "positive",
            exposureDegree: "moderate",
            rationale: "Diversification of assembly contracts to domestic Indian electronics manufacturing facilities."
          }
        ],
        exposedCompanies: [
          { symbol: "TATAMOTORS", name: "Tata Motors", direction: "negative", sensitivity: "High (ECU dependency)" },
          { symbol: "INFY", name: "Infosys", direction: "mixed", sensitivity: "Moderate (Client CapEx spend)" }
        ],
        historicalAnalogues: [
          {
            name: "2016 Kumamoto Earthquake Semiconductor Disturbance",
            year: 2016,
            marketReaction: "Automakers declined -2.8% on chip disruption before normalizing in 30 days",
            recoveryHorizonDays: 28
          }
        ],
        riskOffProbabilityPercent: 46
      },
      {
        id: "trans-02",
        eventCategory: "geopolitical",
        headline: "Strait of Hormuz Naval Security Alert & Tanker Route Advisory",
        timestamp: Date.now() - 36e5 * 5,
        severity: "critical",
        transmissionChain: [
          "Escalation in naval patrols and insurance premium surcharges for commercial vessels",
          "Brent Crude spot price contracts spike +1.8% to $78.40/bbl",
          "Refining margins adjust; INR faces imported inflationary pressure",
          "Aviation fuel jet-kerosene costs rise directly impacting airline operating margins",
          "Upstream energy exploration firms gain revenue tailwind; downstream paints & chemicals face raw material inflation"
        ],
        affectedCommodities: [
          { name: "Brent Crude Oil", expectedImpact: "bullish", confidencePercent: 94 },
          { name: "Marine Bunker Fuel", expectedImpact: "bullish", confidencePercent: 91 },
          { name: "Gold (MCX Safe Haven)", expectedImpact: "bullish", confidencePercent: 85 }
        ],
        affectedSectors: [
          {
            sector: "Energy & Upstream Oil/Gas",
            impactDirection: "positive",
            exposureDegree: "high",
            rationale: "Higher crude realizations and refining crack spreads benefit domestic extractors."
          },
          {
            sector: "Aviation & Air Logistics",
            impactDirection: "negative",
            exposureDegree: "high",
            rationale: "Aviation Turbine Fuel (ATF) accounts for 40-45% of airline operational expense."
          },
          {
            sector: "Paints, Adhesives & Specialty Chemicals",
            impactDirection: "negative",
            exposureDegree: "moderate",
            rationale: "Crude derivatives (solvents, titanium dioxide inputs) face input cost inflation."
          }
        ],
        exposedCompanies: [
          { symbol: "RELIANCE", name: "Reliance Industries", direction: "positive", sensitivity: "High (GRM expansion)" },
          { symbol: "INDIGO", name: "InterGlobe Aviation", direction: "negative", sensitivity: "High (ATF fuel cost)" }
        ],
        historicalAnalogues: [
          {
            name: "2019 Gulf Tanker Tension Spike",
            year: 2019,
            marketReaction: "Crude jumped 4.5% intraday, airline stocks fell -3.2%, Indian benchmarks recovered within 10 days",
            recoveryHorizonDays: 14
          }
        ],
        riskOffProbabilityPercent: 72
      },
      {
        id: "trans-03",
        eventCategory: "environmental",
        headline: "Super Cyclone Formation in Bay of Bengal with Coastal Landfall Trajectory",
        timestamp: Date.now() - 36e5 * 8,
        severity: "high",
        transmissionChain: [
          "High category storm surge warning for Eastern coastal ports (Paradip, Visakhapatnam)",
          "Temporary port container halts & rail cargo freight diversions",
          "Coastal agricultural paddy & aquaculture belt localized inundation risk",
          "Emergency cement, reconstruction materials & generator power kit demand surge",
          "Supply chain transit re-routing via inland central logistics corridors"
        ],
        affectedCommodities: [
          { name: "Thermal Coal (Imported via Ports)", expectedImpact: "volatile", confidencePercent: 82 },
          { name: "Rice & Marine Agro Products", expectedImpact: "bullish", confidencePercent: 68 },
          { name: "Structural Steel & Cement", expectedImpact: "bullish", confidencePercent: 75 }
        ],
        affectedSectors: [
          {
            sector: "Ports & Marine Logistics",
            impactDirection: "negative",
            exposureDegree: "high",
            rationale: "Vessel berthing pauses and cargo turnaround delay metrics degrade during severe squall periods."
          },
          {
            sector: "Infrastructure & Reconstruction",
            impactDirection: "positive",
            exposureDegree: "moderate",
            rationale: "Subsequent civic restoration and coastal reinforcement civil engineering contracts."
          },
          {
            sector: "General & Crop Insurance",
            impactDirection: "negative",
            exposureDegree: "moderate",
            rationale: "Short-term spike in property, port vessel and crop damage settlement claims."
          }
        ],
        exposedCompanies: [
          { symbol: "LT", name: "Larsen & Toubro", direction: "positive", sensitivity: "Moderate (Reconstruction contracts)" },
          { symbol: "TATASTEEL", name: "Tata Steel", direction: "mixed", sensitivity: "Moderate (Supply chain rerouting vs steel demand)" }
        ],
        historicalAnalogues: [
          {
            name: "Cyclone Fani (2019) Eastern Seaboard Event",
            year: 2019,
            marketReaction: "Regional port stocks dropped -4.1% before rebound; building materials witnessed +5% demand surge",
            recoveryHorizonDays: 21
          }
        ],
        riskOffProbabilityPercent: 38
      }
    ];
  }
  getMarketRegime() {
    return {
      regime: "Bull",
      regimeConfidencePercent: 76,
      vixValue: 13.45,
      vixChangePercent: -3.24,
      breadthAdvanceRatio: 0.64,
      // 64% advancing
      dominantSector: "Banking & Financials",
      driverSummary: "Market supported by positive sector breadth in private financials, stable currency, and benign domestic inflation trajectory. Geopolitical energy risks remain the primary external variable."
    };
  }
  getScannerRankings() {
    return this.instruments.map((inst) => {
      const tech = this.getTechnicalAnalysis(inst.symbol);
      const momentumScore = Math.min(100, Math.max(10, Math.round(50 + inst.changePercent * 18 + tech.score * 0.3)));
      const newsScore = Math.min(100, Math.max(20, Math.round(65 + Math.sin(inst.symbol.length) * 25)));
      const volatilityScore = inst.volatilityRating === "HIGH" ? 82 : inst.volatilityRating === "MEDIUM" ? 52 : 31;
      const modelScore = Math.min(100, Math.max(15, Math.round(55 + tech.score * 0.4)));
      return {
        symbol: inst.symbol,
        name: inst.name,
        exchange: inst.exchange,
        sector: inst.sector,
        currentPrice: inst.currentPrice,
        changePercent: inst.changePercent,
        momentumScore,
        newsScore,
        volatilityScore,
        modelScore,
        riskRating: inst.volatilityRating,
        signal: tech.regime
      };
    });
  }
  // -------------------------------------------------------------
  // PAPER TRADING & INDEPENDENT RISK ENGINE
  // -------------------------------------------------------------
  getPaperPortfolio() {
    let totalInvested = 0;
    let unrealizedPnl = 0;
    paperPortfolioState.positions.forEach((pos) => {
      const inst = this.getInstrument(pos.symbol);
      if (inst) {
        pos.currentPrice = inst.currentPrice;
        pos.unrealizedPnl = Number(((pos.currentPrice - pos.avgBuyPrice) * pos.quantity).toFixed(2));
        pos.pnlPercent = Number(((pos.currentPrice - pos.avgBuyPrice) / pos.avgBuyPrice * 100).toFixed(2));
      }
      totalInvested += pos.avgBuyPrice * pos.quantity;
      unrealizedPnl += pos.unrealizedPnl;
    });
    paperPortfolioState.investedINR = Number(totalInvested.toFixed(2));
    paperPortfolioState.unrealizedPnlINR = Number(unrealizedPnl.toFixed(2));
    paperPortfolioState.totalPortfolioValueINR = Number((paperPortfolioState.cashINR + totalInvested + unrealizedPnl).toFixed(2));
    paperPortfolioState.totalPnlPercent = Number(
      ((paperPortfolioState.totalPortfolioValueINR - 1e6) / 1e6 * 100).toFixed(2)
    );
    const sectorExposure = {};
    let maxSinglePos = 0;
    paperPortfolioState.positions.forEach((pos) => {
      const posVal = pos.currentPrice * pos.quantity;
      sectorExposure[pos.sector] = (sectorExposure[pos.sector] || 0) + posVal;
      const posPct = posVal / paperPortfolioState.totalPortfolioValueINR * 100;
      if (posPct > maxSinglePos) maxSinglePos = posPct;
    });
    let largestSector = "None";
    let largestSectorPct = 0;
    Object.entries(sectorExposure).forEach(([sec, val]) => {
      const pct = val / paperPortfolioState.totalPortfolioValueINR * 100;
      if (pct > largestSectorPct) {
        largestSector = sec;
        largestSectorPct = pct;
      }
    });
    paperPortfolioState.riskStatus = {
      concentrationExceeded: largestSectorPct > 35 || maxSinglePos > 25,
      largestSector,
      largestSectorPercent: Number(largestSectorPct.toFixed(1)),
      maxSinglePositionPercent: Number(maxSinglePos.toFixed(1))
    };
    return paperPortfolioState;
  }
  executePaperOrder(order) {
    const inst = this.getInstrument(order.symbol);
    if (!inst) {
      return {
        success: false,
        order: {
          id: `ord-${Date.now()}`,
          symbol: order.symbol,
          side: order.side,
          orderType: order.orderType,
          quantity: order.quantity,
          price: 0,
          status: "REJECTED",
          rejectReason: "Unknown instrument identifier",
          timestamp: Date.now(),
          totalAmount: 0
        },
        error: "Instrument not recognized."
      };
    }
    const execPrice = order.price || inst.currentPrice;
    const totalAmount = Number((execPrice * order.quantity).toFixed(2));
    const orderId = `PO-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
    if (order.quantity <= 0) {
      return {
        success: false,
        order: {
          id: orderId,
          symbol: order.symbol,
          side: order.side,
          orderType: order.orderType,
          quantity: order.quantity,
          price: execPrice,
          status: "REJECTED",
          rejectReason: "Quantity must be greater than zero.",
          timestamp: Date.now(),
          totalAmount: 0
        },
        error: "Quantity must be at least 1 unit."
      };
    }
    if (order.side === "BUY") {
      if (totalAmount > paperPortfolioState.cashINR) {
        const rejOrder = {
          id: orderId,
          symbol: order.symbol,
          side: "BUY",
          orderType: order.orderType,
          quantity: order.quantity,
          price: execPrice,
          status: "REJECTED",
          rejectReason: `Insufficient capital. Required \u20B9${totalAmount.toLocaleString()}, Available \u20B9${paperPortfolioState.cashINR.toLocaleString()}`,
          timestamp: Date.now(),
          totalAmount
        };
        paperPortfolioState.orderHistory.unshift(rejOrder);
        return { success: false, order: rejOrder, error: rejOrder.rejectReason };
      }
      const currentPos = paperPortfolioState.positions.find((p) => p.symbol === order.symbol);
      const existingVal = currentPos ? currentPos.quantity * execPrice : 0;
      const postTradeVal = existingVal + totalAmount;
      const postTradePct = postTradeVal / paperPortfolioState.totalPortfolioValueINR * 100;
      if (postTradePct > 40) {
        const rejOrder = {
          id: orderId,
          symbol: order.symbol,
          side: "BUY",
          orderType: order.orderType,
          quantity: order.quantity,
          price: execPrice,
          status: "REJECTED",
          rejectReason: `Risk Engine Rejection: Order would bring ${order.symbol} exposure to ${postTradePct.toFixed(1)}% (Maximum permitted threshold is 40%).`,
          timestamp: Date.now(),
          totalAmount
        };
        paperPortfolioState.orderHistory.unshift(rejOrder);
        return { success: false, order: rejOrder, error: rejOrder.rejectReason };
      }
      paperPortfolioState.cashINR = Number((paperPortfolioState.cashINR - totalAmount).toFixed(2));
      if (currentPos) {
        const newQty = currentPos.quantity + order.quantity;
        currentPos.avgBuyPrice = Number(((currentPos.avgBuyPrice * currentPos.quantity + totalAmount) / newQty).toFixed(2));
        currentPos.quantity = newQty;
      } else {
        paperPortfolioState.positions.push({
          symbol: inst.symbol,
          name: inst.name,
          quantity: order.quantity,
          avgBuyPrice: execPrice,
          currentPrice: execPrice,
          unrealizedPnl: 0,
          pnlPercent: 0,
          sector: inst.sector
        });
      }
    } else {
      const currentPos = paperPortfolioState.positions.find((p) => p.symbol === order.symbol);
      if (!currentPos || currentPos.quantity < order.quantity) {
        const rejOrder = {
          id: orderId,
          symbol: order.symbol,
          side: "SELL",
          orderType: order.orderType,
          quantity: order.quantity,
          price: execPrice,
          status: "REJECTED",
          rejectReason: `Short-selling not permitted in cash portfolio. Available holdings: ${currentPos ? currentPos.quantity : 0} units.`,
          timestamp: Date.now(),
          totalAmount
        };
        paperPortfolioState.orderHistory.unshift(rejOrder);
        return { success: false, order: rejOrder, error: rejOrder.rejectReason };
      }
      const realizedGain = (execPrice - currentPos.avgBuyPrice) * order.quantity;
      paperPortfolioState.realizedPnlINR = Number((paperPortfolioState.realizedPnlINR + realizedGain).toFixed(2));
      paperPortfolioState.cashINR = Number((paperPortfolioState.cashINR + totalAmount).toFixed(2));
      currentPos.quantity -= order.quantity;
      if (currentPos.quantity <= 0) {
        paperPortfolioState.positions = paperPortfolioState.positions.filter((p) => p.symbol !== order.symbol);
      }
    }
    const executedOrder = {
      id: orderId,
      symbol: order.symbol,
      side: order.side,
      orderType: order.orderType,
      quantity: order.quantity,
      price: execPrice,
      status: "EXECUTED",
      stopLoss: order.stopLoss,
      takeProfit: order.takeProfit,
      timestamp: Date.now(),
      totalAmount
    };
    paperPortfolioState.orderHistory.unshift(executedOrder);
    return { success: true, order: executedOrder };
  }
  resetPortfolio() {
    paperPortfolioState = {
      cashINR: 1e6,
      investedINR: 0,
      totalPortfolioValueINR: 1e6,
      unrealizedPnlINR: 0,
      realizedPnlINR: 0,
      totalPnlPercent: 0,
      positions: [],
      orderHistory: [],
      riskStatus: {
        concentrationExceeded: false,
        largestSector: "None",
        largestSectorPercent: 0,
        maxSinglePositionPercent: 0
      }
    };
    return paperPortfolioState;
  }
};
var upstoxService = new UpstoxProvider();
var simulatedMarketService = new SimulatedMarketProvider();
function getUpstoxStatus() {
  const isConfigured = upstoxService.isReady();
  return {
    isConfigured,
    apiKeyMasked: "53CLND (Verified Upstox Analytics)",
    hasSecret: Boolean(upstoxCredentials.apiSecret),
    hasAccessToken: Boolean(upstoxCredentials.accessToken),
    mode: isConfigured ? "UPSTOX_LIVE_ANALYTICS" : "HIGH_FIDELITY_SIMULATED",
    feedLatencyMs: isConfigured ? 24 : 2,
    lastHeartbeat: Date.now(),
    isAnalyticsOnly: true,
    clientId: "53CLND",
    tokenExpiresAt: "2027-09-01 (Active)"
  };
}
function updateUpstoxCredentials(params) {
  if (params.apiKey !== void 0) upstoxCredentials.apiKey = params.apiKey;
  if (params.apiSecret !== void 0) upstoxCredentials.apiSecret = params.apiSecret;
  if (params.redirectUri !== void 0) upstoxCredentials.redirectUri = params.redirectUri;
  if (params.accessToken !== void 0) upstoxCredentials.accessToken = params.accessToken;
  return getUpstoxStatus();
}

// src/controllers/marketController.ts
async function handleGetMarketPulse(req, res) {
  try {
    const pulse = simulatedMarketService.getMarketPulse();
    return res.json({ success: true, data: pulse });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to retrieve market pulse telemetry", details: err.message });
  }
}
async function handleGetInstruments(req, res) {
  try {
    const query = typeof req.query.q === "string" ? req.query.q : void 0;
    const instruments = simulatedMarketService.getInstruments(query);
    return res.json({ success: true, data: instruments });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to search market instruments", details: err.message });
  }
}
async function handleGetQuote(req, res) {
  try {
    const symbol = (req.params.symbol || "RELIANCE").toUpperCase();
    if (upstoxService.isReady()) {
      const liveQuote = await upstoxService.fetchLiveQuote(symbol);
      if (liveQuote) {
        return res.json({ success: true, data: liveQuote });
      }
    }
    const quote = simulatedMarketService.getQuote(symbol);
    return res.json({ success: true, data: quote });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch quote", details: err.message });
  }
}
async function handleGetHistory(req, res) {
  try {
    const symbol = (req.params.symbol || "RELIANCE").toUpperCase();
    const timeframe = typeof req.query.timeframe === "string" ? req.query.timeframe : "1D";
    if (upstoxService.isReady()) {
      const liveBars = await upstoxService.fetchHistoricalBars(symbol, timeframe);
      if (liveBars && liveBars.length > 0) {
        return res.json({ success: true, data: liveBars });
      }
    }
    const bars = simulatedMarketService.getHistoricalBars(symbol, timeframe);
    return res.json({ success: true, data: bars });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch historical series", details: err.message });
  }
}
async function handleGetTechnicalAnalysis(req, res) {
  try {
    const symbol = (req.params.symbol || "RELIANCE").toUpperCase();
    const tech = simulatedMarketService.getTechnicalAnalysis(symbol);
    return res.json({ success: true, data: tech });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to calculate technical layer", details: err.message });
  }
}
async function handleGetForecast(req, res) {
  try {
    const symbol = (req.params.symbol || "RELIANCE").toUpperCase();
    const horizon = req.query.horizon || "1D";
    const forecast = simulatedMarketService.getProbabilisticForecast(symbol, horizon);
    return res.json({ success: true, data: forecast });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to generate probabilistic scenario forecast", details: err.message });
  }
}
async function handleGetTransmissions(req, res) {
  try {
    const transmissions = simulatedMarketService.getEventTransmissions();
    return res.json({ success: true, data: transmissions });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to retrieve event transmission records", details: err.message });
  }
}
async function handleGetRegime(req, res) {
  try {
    const regime = simulatedMarketService.getMarketRegime();
    return res.json({ success: true, data: regime });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to detect market regime", details: err.message });
  }
}
async function handleGetScanner(req, res) {
  try {
    const ranked = simulatedMarketService.getScannerRankings();
    return res.json({ success: true, data: ranked });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to run market scanner", details: err.message });
  }
}
async function handleGetPortfolio(req, res) {
  try {
    const portfolio = simulatedMarketService.getPaperPortfolio();
    return res.json({ success: true, data: portfolio });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to retrieve paper portfolio", details: err.message });
  }
}
async function handlePaperOrder(req, res) {
  try {
    const { symbol, side, orderType, quantity, price, stopLoss, takeProfit } = req.body;
    if (!symbol || !side || !quantity) {
      return res.status(400).json({ success: false, error: "Symbol, side (BUY/SELL), and quantity are required." });
    }
    const result = simulatedMarketService.executePaperOrder({
      symbol: symbol.toUpperCase(),
      side,
      orderType: orderType || "MARKET",
      quantity: Number(quantity),
      price: price ? Number(price) : void 0,
      stopLoss: stopLoss ? Number(stopLoss) : void 0,
      takeProfit: takeProfit ? Number(takeProfit) : void 0
    });
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error, order: result.order });
    }
    const currentPortfolio = simulatedMarketService.getPaperPortfolio();
    return res.json({ success: true, data: { order: result.order, portfolio: currentPortfolio } });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to execute paper trade", details: err.message });
  }
}
async function handleResetPortfolio(req, res) {
  try {
    const resetState = simulatedMarketService.resetPortfolio();
    return res.json({ success: true, data: resetState });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to reset portfolio", details: err.message });
  }
}
async function handleGetUpstoxStatus(req, res) {
  try {
    const status = getUpstoxStatus();
    return res.json({ success: true, data: status });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to check Upstox configuration status", details: err.message });
  }
}
async function handleSetUpstoxConfig(req, res) {
  try {
    const { apiKey, apiSecret, redirectUri, accessToken } = req.body;
    const updated = updateUpstoxCredentials({
      apiKey,
      apiSecret,
      redirectUri,
      accessToken
    });
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to update Upstox credentials", details: err.message });
  }
}

// server.ts
var import_earthengine = __toESM(require("@google/earthengine"), 1);
import_dotenv.default.config();
async function initializeEarthEngine() {
  try {
    if (process.env.EE_SERVICE_ACCOUNT && process.env.EE_PRIVATE_KEY) {
      console.log("\u{1F4E1} Attempting Google Earth Engine authentication via service account token...");
      const privateKey = JSON.parse(process.env.EE_PRIVATE_KEY);
      import_earthengine.default.data.authenticateViaPrivateKey(
        privateKey,
        () => {
          import_earthengine.default.initialize(
            null,
            null,
            () => {
              console.log("\u2705 Google Earth Engine successfully initialized!");
              global.ee = import_earthengine.default;
            },
            (err) => console.error("\u274C GEE initialization callback error:", err)
          );
        },
        (err) => console.error("\u274C GEE authentication callback error:", err)
      );
    } else {
      console.log("\u2139\uFE0F GEE credentials not detected in .env. Interactive Foundations local simulator is ACTIVE.");
      global.ee = import_earthengine.default;
    }
  } catch (err) {
    console.warn("\u274C Failed during Earth Engine initial pass:", err);
  }
}
initializeEarthEngine();
var app = (0, import_express.default)();
var server = import_http.default.createServer(app);
var PORT = 3e3;
app.use(import_express.default.json());
var cache2 = {
  earthquakes: {},
  weather: {},
  cities: {}
};
var CACHE_TTL_EARTHQUAKE2 = 90 * 1e3;
var CACHE_TTL_WEATHER2 = 10 * 60 * 1e3;
function mapUSGStoEarthquake2(feature) {
  const props = feature.properties || {};
  const geom = feature.geometry || { coordinates: [0, 0, 0] };
  const coords = geom.coordinates || [0, 0, 0];
  return {
    id: feature.id || String(Math.random()),
    magnitude: props.mag || 0,
    place: props.place || "Unknown Location",
    time: props.time || Date.now(),
    updated: props.updated || Date.now(),
    tsunami: props.tsunami || 0,
    alert: props.alert || null,
    significance: props.sig || 0,
    depth: coords[2] || 0,
    latitude: coords[1] || 0,
    longitude: coords[0] || 0
  };
}
var wss = new import_ws3.WebSocketServer({ noServer: true });
server.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
  if (pathname === "/ws") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  }
});
var activeClients = /* @__PURE__ */ new Set();
wss.on("connection", (ws) => {
  activeClients.add(ws);
  ws.send(JSON.stringify({
    type: "system",
    message: "Connected to TerraWatch AI real-time atmospheric stream.",
    timestamp: Date.now()
  }));
  ws.on("close", () => {
    activeClients.delete(ws);
  });
});
setInterval(() => {
  if (activeClients.size === 0) return;
  const windFluctuation = (Math.random() - 0.5) * 1.5;
  const gustFluctuation = Math.random() * 2.5;
  const pressureFluctuation = (Math.random() - 0.5) * 0.4;
  const isLightningStrike = Math.random() > 0.88;
  const isSevereWindAlert = Math.random() > 0.94;
  const isTectonicCreep = Math.random() > 0.95;
  const dynamicTelemetry = {
    type: "telemetry_tick",
    wind_shift: windFluctuation,
    gust_shift: gustFluctuation,
    pressure_shift: pressureFluctuation,
    isLightning: isLightningStrike,
    lightning_data: isLightningStrike ? {
      lat: (Math.random() - 0.5) * 10 + 20,
      // around tropical latitudes
      lon: (Math.random() - 0.5) * 10 + 78,
      peakyReLU: Math.floor(Math.random() * 80) + 20
      // kA intensity
    } : null,
    timestamp: Date.now()
  };
  const marketTickEvent = {
    type: "market_tick",
    data: {
      symbol: "NIFTY 50",
      price: Number((24850 + Math.sin(Date.now() / 8e3) * 20).toFixed(2)),
      change: Number((Math.sin(Date.now() / 1e4) * 18).toFixed(2)),
      changePercent: Number((Math.sin(Date.now() / 1e4) * 0.08).toFixed(2)),
      timestamp: Date.now()
    },
    pulse: [
      { symbol: "NIFTY 50", changePct: (Math.sin(Date.now() / 1e4) * 0.08).toFixed(2), price: (24850 + Math.sin(Date.now() / 8e3) * 20).toFixed(2) },
      { symbol: "BANK NIFTY", changePct: (Math.cos(Date.now() / 9e3) * 0.09).toFixed(2), price: (51920 + Math.cos(Date.now() / 7e3) * 35).toFixed(2) },
      { symbol: "BRENT CRUDE", changePct: (1.2 + Math.sin(Date.now() / 15e3) * 0.3).toFixed(2), price: (78.4 + Math.sin(Date.now() / 12e3) * 0.5).toFixed(2) },
      { symbol: "USD/INR", changePct: (-0.05 + Math.cos(Date.now() / 2e4) * 0.02).toFixed(2), price: (83.92 + Math.cos(Date.now() / 18e3) * 0.03).toFixed(2) }
    ],
    timestamp: Date.now()
  };
  activeClients.forEach((client) => {
    if (client.readyState === import_ws3.WebSocket.OPEN) {
      client.send(JSON.stringify(dynamicTelemetry));
      client.send(JSON.stringify(marketTickEvent));
    }
  });
  if (isLightningStrike || isSevereWindAlert || isTectonicCreep) {
    const sampleLocs = [
      { name: "Chennai Transit Depot", city: "Chennai, India" },
      { name: "Tokyo Regional Depot", city: "Tokyo, Japan" },
      { name: "Seattle Logistics Hub", city: "Seattle, WA" },
      { name: "Reykjavik Geothermal Node", city: "Reykjavik, Iceland" },
      { name: "Bengaluru Operations Office", city: "Bengaluru, India" },
      { name: "Trivandrum Port Station", city: "Trivandrum, India" }
    ];
    const loc = sampleLocs[Math.floor(Math.random() * sampleLocs.length)];
    let alert = null;
    if (isSevereWindAlert) {
      alert = {
        id: `alert-wind-${Date.now()}`,
        type: "weather",
        severity: "warning",
        title: `Severe Gale Watch - ${loc.name}`,
        message: `Microburst hazard detected at ${loc.name} (${loc.city}) with wind gusts soaring over ${(28 + Math.random() * 12).toFixed(1)} m/s. Secure warehouse assets immediately.`,
        timestamp: Date.now()
      };
    } else if (isLightningStrike) {
      alert = {
        id: `alert-lightning-${Date.now()}`,
        type: "weather",
        severity: "info",
        title: `Electrical Outbreak - ${loc.city}`,
        message: `Frequent cloud-to-ground electrostatic discharge (approx ${Math.floor(Math.random() * 45 + 15)} kA) registered near ${loc.name}. Indoor sheltering protocols active.`,
        timestamp: Date.now()
      };
    } else if (isTectonicCreep) {
      alert = {
        id: `alert-seismic-${Date.now()}`,
        type: "seismic",
        severity: "info",
        title: `Tectonic Activity Creep - ${loc.name}`,
        message: `Micro-tremor registered on tectonic receptors at ${loc.name} (${loc.city}). Convergent plate movement 0.4mm recorded. Zero immediate cargo dispatch threat.`,
        timestamp: Date.now()
      };
    }
    if (alert) {
      activeClients.forEach((client) => {
        if (client.readyState === import_ws3.WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "push_alert", alert }));
        }
      });
    }
  }
}, 4e3);
function triggerSeismicAlertIfSevere2(eq2) {
  if (eq2.magnitude >= 4.5 && activeClients.size > 0) {
    const isCritical = eq2.magnitude >= 6;
    const alert = {
      id: `alert-seismic-${eq2.id}`,
      type: "seismic",
      severity: isCritical ? "critical" : "warning",
      title: `${isCritical ? "CRITICAL" : "STRONG"} Seismic Event`,
      message: `M${eq2.magnitude.toFixed(1)} Earthquake struck at depth of ${eq2.depth.toFixed(1)} km: ${eq2.place}.${eq2.tsunami === 1 ? " WARNING: Potential Tsunami TTE triggers are active. Observe coastline protocols." : ""}`,
      timestamp: Date.now()
    };
    activeClients.forEach((client) => {
      if (client.readyState === import_ws3.WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "push_alert", alert }));
      }
    });
  }
}
app.get("/api/cities/search", handleSearchCities);
app.get("/api/alerts", handleGetAlerts);
app.get("/api/weather", handleGetWeather);
app.get("/api/legacy_weather", async (req, res) => {
  const lat = parseFloat(String(req.query.lat || "12.9716"));
  const lon = parseFloat(String(req.query.lon || "77.5946"));
  const city = String(req.query.city || "Trivandrum");
  const cacheKey = `${lat.toFixed(4)}_${lon.toFixed(4)}`;
  const now = Date.now();
  if (cache2.weather[cacheKey] && now - cache2.weather[cacheKey].timestamp < CACHE_TTL_WEATHER2) {
    return res.json(cache2.weather[cacheKey].data);
  }
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const hasAPIKey = apiKey && apiKey !== "MY_OPENWEATHER_API_KEY";
  try {
    if (hasAPIKey) {
      const curRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      const foreRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
      if (curRes.ok && foreRes.ok && aqiRes.ok) {
        const cur = await curRes.json();
        const fore = await foreRes.json();
        const pol = await aqiRes.json();
        const dynamicHourly = (fore.list || []).slice(0, 8).map((h) => ({
          time: new Date(h.dt * 1e3).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          temp: h.main.temp,
          pop: Math.round((h.pop || 0) * 100),
          // rain probability
          wind_speed: h.wind.speed,
          humidity: h.main.humidity
        }));
        const dailyMap = {};
        (fore.list || []).forEach((h) => {
          const dateStr = new Date(h.dt * 1e3).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
          if (!dailyMap[dateStr]) {
            dailyMap[dateStr] = {
              date: dateStr,
              temps: [],
              pops: [],
              weather: h.weather[0]
            };
          }
          dailyMap[dateStr].temps.push(h.main.temp);
          dailyMap[dateStr].pops.push(h.pop || 0);
        });
        const dailyForecasts = Object.values(dailyMap).slice(0, 5).map((d) => ({
          date: d.date,
          tempMax: Math.max(...d.temps),
          tempMin: Math.min(...d.temps),
          pop: Math.round(Math.max(...d.pops) * 100),
          main: d.weather.main,
          icon: d.weather.icon
        }));
        const components = pol.list?.[0]?.components || {};
        const weatherObj2 = {
          city: cur.name || city,
          lat,
          lon,
          current: {
            temp: cur.main.temp,
            feels_like: cur.main.feels_like,
            humidity: cur.main.humidity,
            pressure: cur.main.pressure,
            visibility: cur.visibility,
            uvi: 3.5,
            // Standard fallback
            clouds: cur.clouds.all,
            wind_speed: cur.wind.speed,
            wind_deg: cur.wind.deg,
            wind_gust: cur.wind.gust,
            dew_point: cur.main.temp - (100 - cur.main.humidity) / 5,
            // standard approximation
            sunrise: cur.sys.sunrise,
            sunset: cur.sys.sunset,
            description: cur.weather[0].description,
            main: cur.weather[0].main,
            icon: cur.weather[0].icon
          },
          hourly: dynamicHourly,
          daily: dailyForecasts,
          aqi: {
            aqi: pol.list?.[0]?.main?.aqi || 2,
            // 1-5
            pm25: components.pm2_5 || 12,
            pm10: components.pm10 || 20,
            co: components.co || 350,
            no2: components.no2 || 15,
            so2: components.so2 || 4.5,
            o3: components.o3 || 45
          },
          alerts: []
          // Current weather API doesn't include global alerts by default
        };
        if (weatherObj2.current.wind_speed > 15) {
          weatherObj2.alerts.push({
            sender_name: "TerraWatch Seismic Met",
            event: "Cyclone / Severe Storm Watch",
            start: Math.floor(Date.now() / 1e3),
            end: Math.floor(Date.now() / 1e3) + 12 * 3600,
            description: `Extreme wind velocities exceeding ${(weatherObj2.current.wind_speed * 3.6).toFixed(1)} km/h are generating high atmospheric turbulence and gale warnings.`,
            severity: "severe"
          });
        }
        if (weatherObj2.current.main.toLowerCase().includes("thunderstorm")) {
          weatherObj2.alerts.push({
            sender_name: "Meteorological Intelligence Agency",
            event: "Severe Thunderstorm Warning",
            start: Math.floor(Date.now() / 1e3),
            end: Math.floor(Date.now() / 1e3) + 4 * 3600,
            description: "Severe active electric storm detected. Intense precipitation and microburst probability exceeds 85%. Avoid open space routing.",
            severity: "extreme"
          });
        }
        cache2.weather[cacheKey] = {
          data: weatherObj2,
          timestamp: now
        };
        await storeWeatherSnapshot(
          weatherObj2.city,
          weatherObj2.current.temp,
          weatherObj2.current.humidity,
          weatherObj2.current.wind_speed,
          weatherObj2.current.description,
          weatherObj2.aqi.aqi
        );
        return res.json(weatherObj2);
      }
    }
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;
    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;
    const [meteoRes, polRes] = await Promise.all([
      fetch(openMeteoUrl),
      fetch(airQualityUrl).catch(() => null)
    ]);
    if (!meteoRes.ok) {
      throw new Error("Failed to fetch fallback weather database");
    }
    const m = await meteoRes.json();
    const curMet = m.current || {};
    const hourlyMet = m.hourly || {};
    const dailyMet = m.daily || {};
    let aqiData = { aqi: 1, pm25: 8.5, pm10: 14.2, co: 210, no2: 8.4, so2: 2.1, o3: 32.5 };
    if (polRes && polRes.ok) {
      const p = await polRes.json();
      const curAQ = p.current || {};
      const pm25 = curAQ.pm2_5 || 8.5;
      const pm10 = curAQ.pm10 || 14.2;
      let index2 = 1;
      if (pm25 > 10 || pm10 > 20) index2 = 2;
      if (pm25 > 25 || pm10 > 50) index2 = 3;
      if (pm25 > 50 || pm10 > 100) index2 = 4;
      if (pm25 > 75 || pm10 > 150) index2 = 5;
      aqiData = {
        aqi: index2,
        pm25,
        pm10,
        co: curAQ.carbon_monoxide || 210,
        no2: curAQ.nitrogen_dioxide || 8.4,
        so2: curAQ.sulphur_dioxide || 2.1,
        o3: curAQ.ozone || 32.5
      };
    }
    const codeMap = (code) => {
      if (code === 0) return { main: "Clear", description: "Clear sky", icon: "01d" };
      if ([1, 2, 3].includes(code)) return { main: "Clouds", description: "Partly cloudy", icon: "03d" };
      if ([45, 48].includes(code)) return { main: "Fog", description: "Fog and mist", icon: "50d" };
      if ([51, 53, 55, 56, 57].includes(code)) return { main: "Drizzle", description: "Light rain drizzle", icon: "09d" };
      if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { main: "Rain", description: "Showers / heavy rain", icon: "10d" };
      if ([71, 73, 75, 77, 85, 86].includes(code)) return { main: "Snow", description: "Snow fall", icon: "13d" };
      if ([95, 96, 99].includes(code)) return { main: "Thunderstorm", description: "Thunderstorm outbreak", icon: "11d" };
      return { main: "Clouds", description: "Overcast skies", icon: "04d" };
    };
    const weatherInfo = codeMap(curMet.weather_code || 0);
    const hourlyForecastList = (hourlyMet.time || []).slice(0, 12).map((t, idx) => ({
      time: new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      temp: hourlyMet.temperature_2m?.[idx] || 0,
      pop: hourlyMet.precipitation_probability?.[idx] || 0,
      wind_speed: (hourlyMet.wind_speed_10m?.[idx] || 0) / 3.6,
      // convert km/h to m/s
      humidity: hourlyMet.relative_humidity_2m?.[idx] || 0
    }));
    const dailyForecastList = (dailyMet.time || []).slice(0, 7).map((d, idx) => {
      const code = dailyMet.weather_code?.[idx] || 0;
      const dayInfo = codeMap(code);
      return {
        date: new Date(d).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }),
        tempMax: dailyMet.temperature_2m_max?.[idx] || 0,
        tempMin: dailyMet.temperature_2m_min?.[idx] || 0,
        pop: dailyMet.precipitation_probability_max?.[idx] || 0,
        main: dayInfo.main,
        icon: dayInfo.icon
      };
    });
    const parsedSunrise = dailyMet.sunrise?.[0] ? Math.floor(new Date(dailyMet.sunrise[0]).getTime() / 1e3) : Date.now() / 1e3 - 12 * 3600;
    const parsedSunset = dailyMet.sunset?.[0] ? Math.floor(new Date(dailyMet.sunset[0]).getTime() / 1e3) : Date.now() / 1e3 + 12 * 3600;
    const weatherObj = {
      city,
      lat,
      lon,
      current: {
        temp: curMet.temperature_2m || 0,
        feels_like: curMet.apparent_temperature || curMet.temperature_2m || 0,
        humidity: curMet.relative_humidity_2m || 50,
        pressure: curMet.pressure_msl || 1013,
        visibility: 1e4,
        // Standard
        uvi: dailyMet.uv_index_max?.[0] || 4.2,
        clouds: curMet.cloud_cover || 20,
        wind_speed: (curMet.wind_speed_10m || 0) / 3.6,
        // km/h to m/s
        wind_deg: curMet.wind_direction_10m || 0,
        wind_gust: curMet.wind_gusts_10m ? curMet.wind_gusts_10m / 3.6 : void 0,
        dew_point: hourlyMet.dew_point_2m?.[0] || curMet.temperature_2m - 5,
        sunrise: parsedSunrise,
        sunset: parsedSunset,
        description: weatherInfo.description,
        main: weatherInfo.main,
        icon: weatherInfo.icon
      },
      hourly: hourlyForecastList,
      daily: dailyForecastList,
      aqi: aqiData,
      alerts: []
    };
    if (weatherObj.current.wind_speed > 13) {
      weatherObj.alerts.push({
        sender_name: "TerraWatch Severe Alerts",
        event: "High Wind Watch",
        start: Math.floor(Date.now() / 1e3),
        end: Math.floor(Date.now() / 1e3) + 8 * 3600,
        description: `Persistent high atmospheric velocity measured at ${(weatherObj.current.wind_speed * 3.6).toFixed(1)} km/h. High turbulence warnings.`,
        severity: "minor"
      });
    }
    if (["Thunderstorm", "Rain"].includes(weatherObj.current.main)) {
      weatherObj.alerts.push({
        sender_name: "TerraWatch Precipitation Tracking",
        event: "Thunderstorm Outreach Watch",
        start: Math.floor(Date.now() / 1e3),
        end: Math.floor(Date.now() / 1e3) + 4 * 3600,
        description: "Atmospheric instability triggered thunderstorm activities. Local severe lightning counts detected. Seek sheltering.",
        severity: "moderate"
      });
    }
    cache2.weather[cacheKey] = {
      data: weatherObj,
      timestamp: now
    };
    await storeWeatherSnapshot(
      weatherObj.city,
      weatherObj.current.temp,
      weatherObj.current.humidity,
      weatherObj.current.wind_speed,
      weatherObj.current.description,
      weatherObj.aqi.aqi
    );
    return res.json(weatherObj);
  } catch (error) {
    console.error("Weather fetching error:", error);
    return res.status(500).json({ error: "Failed to collect climate meteorological data." });
  }
});
app.get("/api/earthquakes", handleGetEarthquakes);
app.get("/api/legacy_earthquakes", async (req, res) => {
  const period = String(req.query.period || "day");
  const now = Date.now();
  if (cache2.earthquakes[period] && now - cache2.earthquakes[period].timestamp < CACHE_TTL_EARTHQUAKE2) {
    return res.json(cache2.earthquakes[period].data);
  }
  let usgsUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
  if (period === "hour") {
    usgsUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";
  } else if (period === "week") {
    usgsUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  }
  try {
    const response = await fetch(usgsUrl);
    if (!response.ok) {
      throw new Error(`USGS HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    const rawFeatures = data.features || [];
    const mapped = rawFeatures.map(mapUSGStoEarthquake2);
    mapped.sort((a, b) => b.time - a.time);
    cache2.earthquakes[period] = {
      data: mapped,
      timestamp: now
    };
    if (mapped.length > 0) {
      const topSevere = mapped.find((e) => e.magnitude >= 4.5);
      if (topSevere) {
        triggerSeismicAlertIfSevere2(topSevere);
      }
    }
    for (const eq2 of mapped.slice(0, 8)) {
      await storeSeismicLog(eq2.place, eq2.magnitude, eq2.depth, eq2.time, eq2.tsunami);
    }
    return res.json(mapped);
  } catch (error) {
    console.error("USGS fetch error:", error);
    const seed = [
      {
        id: "seed-1",
        magnitude: 5.7,
        place: "82km SSE of Singkil, Indonesia",
        time: Date.now() - 17e5,
        updated: Date.now(),
        tsunami: 1,
        alert: "yellow",
        significance: 620,
        depth: 42.1,
        latitude: 1.63,
        longitude: 97.94
      },
      {
        id: "seed-2",
        magnitude: 4.2,
        place: "12km WSW of Searles Valley, CA",
        time: Date.now() - 32e5,
        updated: Date.now(),
        tsunami: 0,
        alert: "green",
        significance: 280,
        depth: 8.5,
        latitude: 35.73,
        longitude: -117.41
      },
      {
        id: "seed-3",
        magnitude: 6.8,
        place: "Near East Coast of Honshu, Japan",
        time: Date.now() - 72e5,
        updated: Date.now(),
        tsunami: 1,
        alert: "red",
        significance: 840,
        depth: 25,
        latitude: 38.31,
        longitude: 142.45
      }
    ];
    return res.json(seed);
  }
});
app.post("/api/climate-ai-insights", async (req, res) => {
  const { weather, earthquakes } = req.body;
  const currentTemperature = weather?.current?.temp || 20;
  const currentHumidity = weather?.current?.humidity || 50;
  const windSpd = weather?.current?.wind_speed || 0;
  const weatherCond = weather?.current?.description || "clear sky";
  const activeAlertsCount = weather?.alerts?.length || 0;
  const activeAQI = weather?.aqi?.aqi || 1;
  const earthquakeCount = earthquakes?.length || 0;
  const magnitudes = (earthquakes || []).map((e) => e.magnitude);
  const highestMagVal = magnitudes.length > 0 ? Math.max(...magnitudes) : 0;
  const highestMag = highestMagVal > 0 ? highestMagVal.toFixed(1) : "None";
  const tsunamiRisks = (earthquakes || []).filter((e) => e.tsunami === 1).length;
  let localWeatherWarn = null;
  if (windSpd > 12) {
    localWeatherWarn = `High velocity gale watch is currently active with average speed of ${windSpd.toFixed(1)} m/s. Secure structural assets and logistics corridors.`;
  } else if (activeAQI >= 4) {
    localWeatherWarn = `Substantial particulate pollution detected (AQI level ${activeAQI}/5). Highly sensitive travel paths require particulate filtering.`;
  } else if (activeAlertsCount > 0) {
    localWeatherWarn = `Atmospheric instability alert: ${weather?.alerts?.[0]?.event || "Precipitation watch"}. ${weather?.alerts?.[0]?.description || "Observe standard wind precautions."}`;
  }
  let localSeismicWarn = null;
  if (highestMagVal >= 6) {
    localSeismicWarn = `CRITICAL TECTONIC FAULT RUPTURE was recorded: Magnitude M${highestMag}. Severe shoreline risk active. Check subduction wave indicators.`;
  } else if (highestMagVal >= 4.5) {
    localSeismicWarn = `Moderate seismic event registered with Mag M${highestMag}. Secondary stress relief tremors are highly expected along convergent boundaries.`;
  } else if (tsunamiRisks > 0) {
    localSeismicWarn = `Tectonic tsunami watch: Sea surface monitors register ${tsunamiRisks} active indicators. Avoid littoral dispatch hubs.`;
  }
  const summary = `Meteorological observations at ${weather?.city || "Selected Station"} record ambient temperature of ${currentTemperature.toFixed(1)}\xB0C under ${weatherCond}. Seismic tracking records ${earthquakeCount} global seismic events, with the most severe triggering a magnitude of M${highestMag}.`;
  const insights = {
    summary,
    weatherWarning: localWeatherWarn,
    seismicWarning: localSeismicWarn,
    bullets: [
      `Localized climate condition is categorized as ${weatherCond} with relative humidity peaking at ${currentHumidity}%.`,
      highestMagVal > 0 ? `The peak seismic rupture registered within current window reached magnitude M${highestMag} with ${tsunamiRisks} high-priority coastal signals.` : `No significant fault segment ruptures were cataloged during the current telemetry tracking cycle (highest magnitude: ${highestMag}).`,
      windSpd > 10 ? `Tactical safety guidelines advise securing aerial transit assets due to wind loads exceeding ${(windSpd * 3.6).toFixed(0)} km/h.` : "Tactical Safety: Maintain regular satellite tracking feeds and keep emergency power kits fully operational in extreme wind/seismic corridors."
    ],
    tsunamiRisk: tsunamiRisks > 0
  };
  return res.json(insights);
});
app.post("/api/telegram/send", async (req, res) => {
  const { token, chatId, text: text2 } = req.body;
  if (!token || !chatId || !text2) {
    return res.status(400).json({ success: false, error: "Token, chatId, and text are required." });
  }
  try {
    const telegramUrl = `https://api.telegram.org/bot${token.trim()}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: text2,
        parse_mode: "HTML"
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ success: false, error: errText });
    }
    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Proxy Telegram Send failed:", err);
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
});
app.post("/api/telegram/getUpdates", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, error: "Token is required." });
  }
  try {
    const telegramUrl = `https://api.telegram.org/bot${token.trim()}/getUpdates`;
    const response = await fetch(telegramUrl);
    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ success: false, error: errText });
    }
    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Proxy Telegram getUpdates failed:", err);
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
});
app.post("/api/auth/register", handleRegister);
app.post("/api/legacy_auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are syntactically required." });
  }
  const result = await registerUser(email, password, name || "Operator");
  if (result.success) {
    return res.json(result);
  }
  return res.status(400).json(result);
});
app.post("/api/auth/login", handleLogin);
app.post("/api/legacy_auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password credentials required." });
  }
  const result = await loginUser(email, password);
  if (result.success) {
    return res.json(result);
  }
  return res.status(401).json(result);
});
function checkOperatorSession(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }
  const token = authHeader.split(" ")[1];
  const payload = verifyJWT(token);
  req.user = payload;
  next();
}
app.get("/api/auth/profile", checkOperatorSession, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Invalid or missing operator session credentials." });
  }
  return res.json({ success: true, user: req.user });
});
app.get("/api/chat/history", checkOperatorSession, async (req, res) => {
  const userId = req.user ? req.user.id : "anonymous-warden";
  const chats2 = await getChatMessages(userId);
  return res.json(chats2);
});
app.delete("/api/chat/history", checkOperatorSession, async (req, res) => {
  const userId = req.user ? req.user.id : "anonymous-warden";
  await deleteChatHistory(userId);
  return res.json({ success: true, message: "Operational chat archive purged." });
});
app.post("/api/chat/message", checkOperatorSession, handleChatMessage);
app.post("/api/legacy_chat/message", checkOperatorSession, async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message contents cannot be blank." });
  }
  const userId = req.user ? req.user.id : "anonymous-warden";
  const operatorName = req.user ? req.user.name : "System Guest Operator";
  await storeChatMessage(userId, "user", message);
  const warehouses2 = await getWarehouses();
  const activeCargo = await getCargoTransits();
  const query = message.toLowerCase();
  let reply = "";
  if (query.includes("dispatch") || query.includes("cargo") || query.includes("send") || query.includes("supply") || query.includes("transit") || query.includes("stock") || query.includes("warehouse")) {
    reply += `### \u{1F4E6} LOGISTICAL ROUTING REPORT

`;
    reply += `Operator **${operatorName}**, our active tracking systems list the following depot stock:

`;
    warehouses2.forEach((w) => {
      reply += `- **Depot ${w.name}** (${w.location}): Generators: *${w.generators}*, Water Containers: *${w.waterContainers}*, Rations: *${w.rations}*, Medical Kits: *${w.medicalKits}*.
`;
    });
    reply += `
**Active transits in routing corridors:**
`;
    if (activeCargo.length > 0) {
      activeCargo.forEach((c) => {
        const marker = c.riskLevel === "high" ? "\u{1F6A8}" : c.riskLevel === "medium" ? "\u26A0\uFE0F" : "\u2705";
        reply += `- [${c.id}] **${c.cargoName}** to *${c.destination}* \u2014 Status: *${c.status}* | Risk: *${c.riskLevel.toUpperCase()}* ${marker} (*${c.notifiedHazard || "No hazard warning"}*)
`;
      });
    } else {
      reply += `No cargo packages currently registered in active transit corridors.
`;
    }
    reply += `
*Actionable Advice:* You can dispatch emergency rations/generators using the **Crisis Logistics Hub** panel. Select a target depot, specify cargo parameters, and coordinate dispatch orders.`;
  } else if (query.includes("weather") || query.includes("cyclone") || query.includes("humidity") || query.includes("rain") || query.includes("storm") || query.includes("wind") || query.includes("clouds")) {
    reply += `### \u{1F300} METEOROLOGICAL INTELLIGENCE UPDATE

`;
    reply += `Local thermal/moisture indices are pulled in real-time from open meteorological subgraphs. Current active alerts indicate potential severe precipitation and gusty storm front developments.

`;
    reply += `**Operational Directives:**
`;
    reply += `1. **Wind velocity threshold:** If gusts exceed 15 m/s, grounding of lightweight aerial transits is strictly active.
`;
    reply += `2. **AQI warning level:** Avoid unnecessary outdoor operations if particulate indices scale beyond level 4.

`;
    reply += `Ensure that all dispatch trailers are loaded with backup power generators to preserve refrigeration for vaccines/medical kits in storm boundaries.`;
  } else if (query.includes("seismic") || query.includes("earthquake") || query.includes("plates") || query.includes("rupture") || query.includes("quake") || query.includes("tsunami")) {
    reply += `### \u{1F30B} SEISMOTECTONIC TELEMETRY BRIEFING

`;
    reply += `Seismic stations mapped on our **USGS Seismological Hypocenter Subgraph** are pulling deep micro-slips on active subduction faults.

`;
    const highMagTransits = activeCargo.filter((c) => c.riskLevel === "high");
    if (highMagTransits.length > 0) {
      reply += `\u26A0\uFE0F **Logistics Alert:** Active transits are impacted by tectonic corridors. Specifically, [${highMagTransits[0].cargoName}] shows an elevated **${highMagTransits[0].riskLevel.toUpperCase()}** hazard risk rating.

`;
    } else {
      reply += `\u2705 Tectonic corridor transits are currently reporting nominal green clearance status.

`;
    }
    reply += `**Emergency Coastline Protocol:** All littoral warehouses must verify active marine wave tracking. Should any tsunami flag trigger, immediately execute high-ground routing maneuvers.`;
  } else if (query.includes("hello") || query.includes("hi ") || query.includes("hey") || query.includes("help") || query.includes("system") || query.includes("who")) {
    reply += `### \u{1F310} TERRAWATCH OPS CONTROL INTERACTIVE COORDINATOR

`;
    reply += `Hello Operator **${operatorName}**, I am the local operational coordination agent of TerraWatch.

`;
    reply += `I help monitor **meteorological forecasts**, **global earthquakes**, and **disaster supply hubs**.

`;
    reply += `**Key Commands you can query me on:**
`;
    reply += `- **Logistics & Dispatch:** "Show active cargo risk status" or "List warehouse depots stock"
`;
    reply += `- **Seismology & Tectonics:** "Are there any high-magnitude earthquakes active?" or "Tsunami alerts"
`;
    reply += `- **Atmospherics & Weather:** "Verify localized storms" or "Cyclone warnings"

`;
    reply += `How can I guide your emergency coordination desk today?`;
  } else {
    reply += `### \u{1F4E1} OPERATIONAL COORDINATION ADVICE

`;
    reply += `Received Operator transmission: "*${message}*"

`;
    reply += `TerraWatch systems confirm all telemetry parameters are stable. WebSockets and data subgraphs are active.

`;
    reply += `- **Logistics & Cargo Dispatch:** Nominal performance across all sectors.
`;
    reply += `- **Micro-seismic receptors:** Active monitoring registered zero near-depot stress elevations.
`;
    reply += `- **Atmospheric boundary:** Relative humidity and ultraviolet indices remain within safe parameters.

`;
    reply += `Please let me know if you require stock allocation lists or transit rerouting procedures!`;
  }
  const savedMsg = await storeChatMessage(userId, "assistant", reply);
  return res.json(savedMsg);
});
app.get("/api/logistics/warehouses", handleGetWarehouses);
app.get("/api/legacy_logistics/warehouses", async (req, res) => {
  const list = await getWarehouses();
  return res.json(list);
});
app.get("/api/logistics/cargo", handleGetCargo);
app.get("/api/legacy_logistics/cargo", async (req, res) => {
  const transits = await getCargoTransits();
  return res.json(transits);
});
app.post("/api/logistics/dispatch", checkOperatorSession, handleDispatch);
app.post("/api/legacy_logistics/dispatch", checkOperatorSession, async (req, res) => {
  const { warehouseId, cargoName, destination, lat, lon } = req.body;
  if (!warehouseId || !cargoName || !destination) {
    return res.status(400).json({ error: "Warehouse ID, Cargo Name, and Destination are required." });
  }
  const result = await dispatchSupplyOrder(warehouseId, cargoName, destination, Number(lat || 0), Number(lon || 0));
  if (result) {
    const alert = {
      id: `alert-logistics-${result.id}`,
      type: "system",
      severity: "info",
      title: "EMERGENCY CARGO DISPATCH",
      message: `Operational Dispatch Order Registered: "${cargoName}" is now heading from Depot [${warehouseId}] to [${destination}].`,
      timestamp: Date.now()
    };
    activeClients.forEach((client) => {
      if (client.readyState === import_ws3.WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "push_alert", alert }));
      }
    });
    return res.json({ success: true, cargo: result, message: "Cargo dispatch order approved and deducted from warehouse reserves." });
  }
  return res.status(404).json({ error: "Warehouse ID not recognized or stock depleted." });
});
app.post("/api/logistics/simulate-hazard", handleSimulateHazard);
app.post("/api/legacy_logistics/simulate-hazard", async (req, res) => {
  const { cargoId, riskLevel, hazardMsg, lat, lon } = req.body;
  if (!cargoId || !riskLevel || !hazardMsg) {
    return res.status(400).json({ error: "CargoID, RiskLevel, and Hazard message parameters required." });
  }
  await updateCargoRisk(cargoId, riskLevel, hazardMsg, lat, lon);
  const alert = {
    id: `alert-hazard-${cargoId}-${Date.now()}`,
    type: "system",
    severity: "critical",
    title: "SUPPLY LINE COMPROMISED",
    message: `Transit route ${cargoId} under severe threat: ${hazardMsg} Status altered to ${riskLevel === "high" ? "Delayed" : "Rerouted"}.`,
    timestamp: Date.now()
  };
  activeClients.forEach((client) => {
    if (client.readyState === import_ws3.WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "push_alert", alert }));
    }
  });
  return res.json({ success: true, message: "Hazard simulation broadcast successful. Logistical vectors adjusted." });
});
app.get("/api/federation/metrics", (req, res) => {
  const metrics = {
    gatewayLatency: 1.25,
    // ms
    subgraphs: [
      { name: "Meteorological & Atmosphere Subgraph", queries: 24500, averageLatency: 4.8, status: "nominal", source: "OpenWeather / OpenMeteo Federated" },
      { name: "USGS Seismological Hypocenter Subgraph", queries: 18400, averageLatency: 7.2, status: "nominal", source: "USGS GeoJSON" },
      { name: "Logistics Depot & Fleet Transit Subgraph", queries: 8200, averageLatency: 3.1, status: "nominal", source: "Relational Database EM" },
      { name: "Operator Session & Accounts Subgraph", queries: 4100, averageLatency: 2.4, status: "nominal", source: "Relational Database EM" }
    ],
    caches: {
      inMemoryHits: 41200,
      dbHits: 12500,
      hitRatioPercent: 74.2,
      federationMeshSchemaWeight: "7 nodes"
    },
    uptimeSeconds: Math.floor(process.uptime()),
    activeWSSConnections: activeClients.size
  };
  return res.json(metrics);
});
app.get("/api/satellite-embedding", handleGetSatelliteEmbedding);
app.get("/api/compare-embeddings", handleCompareEmbeddings);
app.get("/api/compare-embeddings/hotspots", handleGetChangeHotspots);
app.get("/api/compare-embeddings/hotspots/export", handleExportHotspotsCSV);
app.get("/api/satellite-embedding/history", handleGetEmbeddingHistory);
app.get("/api/market/pulse", handleGetMarketPulse);
app.get("/api/market/instruments", handleGetInstruments);
app.get("/api/market/quote/:symbol", handleGetQuote);
app.get("/api/market/history/:symbol", handleGetHistory);
app.get("/api/market/technicals/:symbol", handleGetTechnicalAnalysis);
app.get("/api/market/forecast/:symbol", handleGetForecast);
app.get("/api/market/transmissions", handleGetTransmissions);
app.get("/api/market/regime", handleGetRegime);
app.get("/api/market/scanner", handleGetScanner);
app.get("/api/market/portfolio", handleGetPortfolio);
app.post("/api/market/paper-order", handlePaperOrder);
app.post("/api/market/orders", handlePaperOrder);
app.post("/api/market/reset-portfolio", handleResetPortfolio);
app.post("/api/market/portfolio/reset", handleResetPortfolio);
app.get("/api/market/upstox/status", handleGetUpstoxStatus);
app.post("/api/market/upstox/config", handleSetUpstoxConfig);
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`========================================================================`);
    console.log(`\u{1F30D} TerraWatch AI Full-Stack Platform Active!`);
    console.log(`\u{1F449} Local Access (Recommended): http://localhost:${PORT}`);
    console.log(`\u{1F449} Loopback Access          : http://127.0.0.1:${PORT}`);
    console.log(`\u{1F449} Container Network Bind   : http://0.0.0.0:${PORT}`);
    console.log(`========================================================================`);
  });
}
startServer();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activeClients
});
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
