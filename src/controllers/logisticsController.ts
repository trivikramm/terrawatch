import { Request, Response } from 'express';
import { WebSocket } from 'ws';
import { activeClients } from '../../server.ts';
import { AlertNotification } from '../types.ts';
import {
  getWarehouses,
  getCargoTransits,
  dispatchSupplyOrder,
  updateCargoRisk,
  storeAlert
} from '../db/dbClient.ts';

export async function handleGetWarehouses(req: Request, res: Response) {
  try {
    const list = await getWarehouses();
    return res.json(list);
  } catch (error: any) {
    console.error('Failed to retrieve depots:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function handleGetCargo(req: Request, res: Response) {
  try {
    const transits = await getCargoTransits();
    return res.json(transits);
  } catch (error: any) {
    console.error('Failed to retrieve cargo transit systems:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function handleDispatch(req: Request, res: Response) {
  try {
    const { warehouseId, cargoName, destination, lat, lon } = req.body;
    if (!warehouseId || !cargoName || !destination) {
      return res.status(400).json({ error: 'Warehouse ID, Cargo Name, and Destination are required.' });
    }
    const result = await dispatchSupplyOrder(warehouseId, cargoName, destination, Number(lat || 0), Number(lon || 0));
    if (result) {
      // Dispatch websocket broadcast alert to connected operators
      const alert: AlertNotification = {
        id: `alert-logistics-${result.id}`,
        type: 'system',
        severity: 'info',
        title: 'EMERGENCY CARGO DISPATCH',
        message: `Operational Dispatch Order Registered: "${cargoName}" is now heading from Depot [${warehouseId}] to [${destination}].`,
        timestamp: Date.now()
      };

      // Store in Cloud SQL DB
      await storeAlert(alert.id, alert.type, alert.severity, alert.title, alert.message, alert.timestamp);

      activeClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'push_alert', alert }));
        }
      });

      return res.json({ success: true, cargo: result, message: 'Cargo dispatch order approved and deducted from warehouse reserves.' });
    }
    return res.status(404).json({ error: 'Warehouse ID not recognized or stock depleted.' });
  } catch (error: any) {
    console.error('Failed to dispatch cargo:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function handleSimulateHazard(req: Request, res: Response) {
  try {
    const { cargoId, riskLevel, hazardMsg, lat, lon } = req.body;
    if (!cargoId || !riskLevel || !hazardMsg) {
      return res.status(400).json({ error: 'CargoID, RiskLevel, and Hazard message parameters required.' });
    }
    await updateCargoRisk(cargoId, riskLevel, hazardMsg, lat, lon);

    // Trigger real-time alert about impacted supply lines
    const alert: AlertNotification = {
      id: `alert-hazard-${cargoId}-${Date.now()}`,
      type: 'system',
      severity: 'critical',
      title: 'SUPPLY LINE COMPROMISED',
      message: `Transit route ${cargoId} under severe threat: ${hazardMsg} Status altered to ${riskLevel === 'high' ? 'Delayed' : 'Rerouted'}.`,
      timestamp: Date.now()
    };

    // Store in Cloud SQL DB
    await storeAlert(alert.id, alert.type, alert.severity, alert.title, alert.message, alert.timestamp);

    activeClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'push_alert', alert }));
      }
    });

    return res.json({ success: true, message: 'Hazard simulation broadcast successful. Logistical vectors adjusted.' });
  } catch (error: any) {
    console.error('Failed to simulate logistical hazard:', error);
    return res.status(500).json({ error: error.message });
  }
}
