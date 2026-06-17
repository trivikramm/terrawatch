import crypto from 'crypto';
import { db } from './index.ts';
import { users, chats, weatherSnapshots, seismicLogs, warehouses, supplyCargo, alerts } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'terrawatch_secure_federated_node_jwt_secret_99884';

// ---------------------------------------------------------
// CRYPTOGRAPHY PASSWORD HASHING (PBKDF2)
// ---------------------------------------------------------
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Lightweight JWT Sign/Verify
function generateJWT(payload: any): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const tokenInput = `${base64Header}.${base64Payload}`;
  const hmac = crypto.createHmac('sha256', JWT_SECRET);
  hmac.update(tokenInput);
  const signature = hmac.digest('base64url');
  
  return `${tokenInput}.${signature}`;
}

export function verifyJWT(token: string): any {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signature] = parts;
    const tokenInput = `${headerB64}.${payloadB64}`;
    
    const hmac = crypto.createHmac('sha256', JWT_SECRET);
    hmac.update(tokenInput);
    const expectedSignature = hmac.digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    // Check expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------
// USER AUTHENTICATION CONTROLLERS (SECURED VIA Cloud SQL)
// ---------------------------------------------------------
export async function registerUser(email: string, rawPass: string, name: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Check existing
    const existing = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (existing.length > 0) {
      return { success: false, message: 'Operator email is already registered.' };
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(rawPass, salt);
    const generatedUid = 'usr-' + crypto.randomUUID();

    const result = await db.insert(users).values({
      uid: generatedUid,
      email: normalizedEmail,
      passwordHash,
      salt,
      name: name.trim() || 'Climate Warden',
    }).returning();

    const newUser = result[0];
    return {
      success: true,
      message: 'Registered successfully.',
      user: { id: newUser.uid, email: newUser.email, name: newUser.name },
    };
  } catch (error: any) {
    console.error('Registration failed:', error);
    return { 
      success: false, 
      message: `An internal database error occurred while registering operator: ${error?.message || error}` 
    };
  }
}

export async function loginUser(email: string, rawPass: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const matchedUsers = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

    if (matchedUsers.length === 0) {
      return { success: false, message: 'Invalid credentials. Portal connection rejected.' };
    }

    const matched = matchedUsers[0];
    if (!matched.salt || !matched.passwordHash) {
      return { success: false, message: 'Warden accounts using external auth must register passkey credentials first.' };
    }

    const computedHash = hashPassword(rawPass, matched.salt);
    if (computedHash !== matched.passwordHash) {
      return { success: false, message: 'Invalid credentials. Portal connection rejected.' };
    }

    const payload = {
      id: matched.uid,
      email: matched.email,
      name: matched.name,
      exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60), // 12 hours
    };

    const token = generateJWT(payload);

    return {
      success: true,
      message: 'Authentication successful.',
      token,
      user: { id: matched.uid, email: matched.email, name: matched.name },
    };
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false, message: 'Database failure during security check.' };
  }
}

// ---------------------------------------------------------
// COGNITIVE CHAT AGENT PERSISTENCE
// ---------------------------------------------------------
export async function storeChatMessage(userId: string, sender: 'user' | 'assistant', message: string) {
  try {
    const result = await db.insert(chats).values({
      userId,
      sender,
      message,
    }).returning();

    return result[0];
  } catch (error) {
    console.error('Store chat failed:', error);
    return { id: 0, userId, sender, message, timestamp: new Date() };
  }
}

export async function getChatMessages(userId: string) {
  try {
    const list = await db.select().from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.timestamp))
      .limit(50);
    return list.reverse();
  } catch (error) {
    console.error('Get chats failed:', error);
    return [];
  }
}

export async function deleteChatHistory(userId: string) {
  try {
    await db.delete(chats).where(eq(chats.userId, userId));
    return true;
  } catch (error) {
    console.error('Delete chat failed:', error);
    return false;
  }
}

// ---------------------------------------------------------
// DISASTER LOGISTICS AND SUPPLY CHAIN CONTROL
// ---------------------------------------------------------
const initialWarehouses = [
  {
    id: 'wh-tokyo',
    name: 'Tokyo Regional Depot',
    location: 'Tokyo, Japan',
    lat: 35.6762,
    lon: 139.6503,
    generators: 120,
    waterContainers: 450,
    rations: 2500,
    medicalKits: 400,
  },
  {
    id: 'wh-chennai',
    name: 'Chennai Port Transit Depot',
    location: 'Chennai, India',
    lat: 13.0827,
    lon: 80.2707,
    generators: 85,
    waterContainers: 600,
    rations: 1800,
    medicalKits: 220,
  },
  {
    id: 'wh-seattle',
    name: 'Seattle Logistics Facility',
    location: 'Seattle, WA',
    lat: 47.6062,
    lon: -122.3321,
    generators: 150,
    waterContainers: 350,
    rations: 3200,
    medicalKits: 500,
  },
  {
    id: 'wh-reykjavik',
    name: 'Reykjavik Geothermal Node',
    location: 'Reykjavik, Iceland',
    lat: 64.1466,
    lon: -21.9426,
    generators: 40,
    waterContainers: 150,
    rations: 900,
    medicalKits: 110,
  }
];

const initialCargo = [
  {
    id: 'cargo-gen-001',
    cargoName: 'Disaster Power Generators (60 Units)',
    warehouseId: 'wh-seattle',
    destination: 'San Francisco Disaster Base',
    status: 'In Transit',
    lat: 41.2000,
    lon: -122.5000,
    riskLevel: 'low',
    notifiedHazard: 'Clear route weather guidelines active.',
  },
  {
    id: 'cargo-med-002',
    cargoName: 'Critical Plasma & Trauma Rations (300 Kits)',
    warehouseId: 'wh-tokyo',
    destination: 'Sendai Seismology Shelter',
    status: 'Delayed',
    lat: 38.3000,
    lon: 142.1000,
    riskLevel: 'high',
    notifiedHazard: 'M6.8 convergent plate rupture strike nearby. Tsunami warning indicators triggered.',
  },
  {
    id: 'cargo-rat-003',
    cargoName: 'Emergency MRE Rations (1500 Packs)',
    warehouseId: 'wh-chennai',
    destination: 'Trivandrum Cyclone Refuge',
    status: 'Rerouted',
    lat: 10.5000,
    lon: 76.5000,
    riskLevel: 'medium',
    notifiedHazard: 'Local active lightning cluster & high wind shear. Slower alternative highway coordinates assigned.',
  }
];

export async function getWarehouses() {
  try {
    const list = await db.select().from(warehouses);
    if (list.length === 0) {
      // Automatic seed
      console.log('Pre-seeding depots into PostgreSQL warehouses table...');
      await db.insert(warehouses).values(initialWarehouses);
      return await db.select().from(warehouses);
    }
    return list;
  } catch (error) {
    console.error('Get warehouses failed:', error);
    return [];
  }
}

export async function getCargoTransits() {
  try {
    const cargoList = await db.select().from(supplyCargo);
    if (cargoList.length === 0) {
      // Ensure warehouses exist first to avoid foreign key errors
      await getWarehouses();
      console.log('Pre-seeding transits into PostgreSQL supply_cargo table...');
      await db.insert(supplyCargo).values(initialCargo);
      return await db.select().from(supplyCargo);
    }
    return cargoList;
  } catch (error) {
    console.error('Get cargo failed:', error);
    return [];
  }
}

export async function dispatchSupplyOrder(warehouseId: string, cargoName: string, destination: string, lat: number, lon: number) {
  try {
    // Force seeding if needed
    const list = await getWarehouses();
    const wh = list.find(w => w.id === warehouseId);
    if (!wh) return null;

    // Deduct stock from the depot
    let generatorsVal = wh.generators;
    let medicalVal = wh.medicalKits;
    let rationsVal = wh.rations;
    let waterVal = wh.waterContainers;

    if (cargoName.toLowerCase().includes('generator')) {
      if (generatorsVal >= 10) generatorsVal -= 10;
    } else if (cargoName.toLowerCase().includes('medical')) {
      if (medicalVal >= 50) medicalVal -= 50;
    } else if (cargoName.toLowerCase().includes('ration') || cargoName.toLowerCase().includes('mre')) {
      if (rationsVal >= 200) rationsVal -= 200;
    } else {
      if (waterVal >= 100) waterVal -= 100;
    }

    // Update database warehouse record
    await db.update(warehouses).set({
      generators: generatorsVal,
      medicalKits: medicalVal,
      rations: rationsVal,
      waterContainers: waterVal,
    }).where(eq(warehouses.id, warehouseId));

    const dispatchedId = 'cargo-dispatched-' + Math.floor(Math.random() * 9000 + 1000);

    const result = await db.insert(supplyCargo).values({
      id: dispatchedId,
      cargoName,
      warehouseId,
      destination,
      status: 'In Transit',
      lat,
      lon,
      riskLevel: 'low',
      notifiedHazard: 'Cargo dispatched locally. Fleet weather routing instructions assigned.',
    }).returning();

    return result[0];
  } catch (error) {
    console.error('Dispatch failed:', error);
    return null;
  }
}

export async function updateCargoRisk(cargoId: string, riskLevel: 'low' | 'medium' | 'high', hazardMsg: string, newLat?: number, newLon?: number) {
  try {
    let updateFields: {
      riskLevel: 'low' | 'medium' | 'high';
      notifiedHazard: string;
      status: string;
      lat?: number;
      lon?: number;
    } = {
      riskLevel,
      notifiedHazard: hazardMsg,
      status: riskLevel === 'high' ? 'Delayed' : (riskLevel === 'medium' ? 'Rerouted' : 'In Transit'),
    };

    if (newLat !== undefined) updateFields.lat = newLat;
    if (newLon !== undefined) updateFields.lon = newLon;

    await db.update(supplyCargo).set(updateFields).where(eq(supplyCargo.id, cargoId));
    return true;
  } catch (error) {
    console.error('Update cargo risk failed:', error);
    return false;
  }
}

// ---------------------------------------------------------
// TELEMETRIC ANALYSIS SNAPSHOTS
// ---------------------------------------------------------
export async function storeWeatherSnapshot(city: string, temp: number, humidity: number, windSpeed: number, condition: string, aqi: number) {
  try {
    await db.insert(weatherSnapshots).values({
      city,
      temp,
      humidity,
      windSpeed,
      condition,
      aqi,
    });
    return true;
  } catch (error) {
    console.error('Store weather snapshot failed:', error);
    return false;
  }
}

export async function storeSeismicLog(place: string, magnitude: number, depth: number, time: number, tsunami: number) {
  try {
    await db.insert(seismicLogs).values({
      place,
      magnitude,
      depth,
      time,
      tsunami,
    });
    return true;
  } catch (error) {
    console.error('Store seismic log failed:', error);
    return false;
  }
}


// ---------------------------------------------------------
// TELEMETRIC ANALYSIS RETRIEVAL
// ---------------------------------------------------------
export async function getWeatherSnapshots(limit = 10) {
  try {
    return await db.select().from(weatherSnapshots).orderBy(desc(weatherSnapshots.timestamp)).limit(limit);
  } catch (error) {
    console.error('Get weather snapshots failed:', error);
    return [];
  }
}

export async function getSeismicLogs(limit = 20) {
  try {
    return await db.select().from(seismicLogs).orderBy(desc(seismicLogs.createdAt)).limit(limit);
  } catch (error) {
    console.error('Get seismic logs failed:', error);
    return [];
  }
}

export async function storeAlert(id: string, type: string, severity: string, title: string, message: string, timestamp: number) {
  try {
    await db.insert(alerts).values({
      id,
      type,
      severity,
      title,
      message,
      timestamp,
    }).onConflictDoNothing();
    return true;
  } catch (error) {
    console.error('Store alert failed:', error);
    return false;
  }
}

export async function getAlerts(limit = 40) {
  try {
    const list = await db.select().from(alerts).orderBy(desc(alerts.timestamp)).limit(limit);
    if (list.length === 0) {
      const initial = [
        {
          id: 'alert-init-1',
          type: 'system',
          severity: 'info',
          title: 'TERRAWATCH NODE ONLINE',
          message: 'Central Climate Warden telemetry node initialized successfully. Real-time satellite links and geoseismic trackers fully synchronized.',
          timestamp: Date.now() - 3600000,
        },
        {
          id: 'alert-init-2',
          type: 'seismic',
          severity: 'warning',
          title: 'TECTONIC ANOMALY DETECTED',
          message: 'Minor subsurface shockwave clusters observed along regional fault margins. Continuing geodetic tracking.',
          timestamp: Date.now() - 1800000,
        },
        {
          id: 'alert-init-3',
          type: 'weather',
          severity: 'critical',
          title: 'SATELLITE WARNING - GALE CONVERGENCE',
          message: 'Atmospheric pressure gradients warning: Cyclone watch threshold exceeded. Coastal depot storm protocols have been distributed.',
          timestamp: Date.now() - 900000,
        }
      ];
      for (const item of initial) {
        await db.insert(alerts).values(item).onConflictDoNothing();
      }
      return await db.select().from(alerts).orderBy(desc(alerts.timestamp)).limit(limit);
    }
    return list;
  } catch (error) {
    console.error('Get alerts failed:', error);
    return [];
  }
}

