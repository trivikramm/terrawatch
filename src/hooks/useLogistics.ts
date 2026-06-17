import { useState } from 'react';

export function useLogistics() {
  const [cargoCount, setCargoCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCargoCount = async () => {
    try {
      const response = await fetch('/api/logistics/cargo');
      if (response.ok) {
        const data = await response.json();
        setCargoCount(data.length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const dispatchCargo = async (warehouseId: string, cargoName: string, destination: string, lat: number, lon: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('terrawatch_token');
      const response = await fetch('/api/logistics/dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ warehouseId, cargoName, destination, lat, lon })
      });
      const data = await response.json();
      if (response.ok) {
        fetchCargoCount();
      }
      return data;
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  };

  const simulateHazard = async (cargoId: string, riskLevel: string, hazardMsg: string, lat: number, lon: number) => {
    setLoading(true);
    try {
      const response = await fetch('/api/logistics/simulate-hazard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cargoId, riskLevel, hazardMsg, lat, lon })
      });
      return await response.json();
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  };

  return { cargoCount, loading, fetchCargoCount, dispatchCargo, simulateHazard };
}
