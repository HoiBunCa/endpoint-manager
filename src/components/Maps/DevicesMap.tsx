import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Device } from '../../types';
import { apiService } from '../../services/apiService';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from '../../hooks/useTranslation'; // Import useTranslation

// Fix for default markers
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DevicesMap: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const { t } = useTranslation(); // Use translation hook
  
  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const data = await apiService.getDevices();
      setDevices(data.filter(d => d.location));
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  };

  const onlineIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const offlineIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  if (devices.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">{t('no_device_locations_available')}</p>
      </div>
    );
  }

  // Calculate center based on devices
  const center = devices.reduce(
    (acc, device) => {
      if (device.location) {
        acc.lat += device.location.latitude;
        acc.lng += device.location.longitude;
        acc.count++;
      }
      return acc;
    },
    { lat: 0, lng: 0, count: 0 }
  );

  const mapCenter: [number, number] = devices.length > 0 && center.count > 0
    ? [center.lat / center.count, center.lng / center.count]
    : [40.7128, -74.0060]; // Default to NYC

  return (
    <MapContainer
      center={mapCenter}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {devices.map((device) => (
        device.location && (
          <Marker
            key={device.id}
            position={[device.location.latitude, device.location.longitude]}
            icon={device.isOnline ? onlineIcon : offlineIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-medium">{device.hostname}</h3>
                <p className="text-sm text-gray-600">{device.platform}</p>
                <p className="text-sm text-gray-600">
                  {t('user')}: {device.assignedUser?.fullName || t('unassigned')}
                </p>
                <p className={`text-sm font-medium ${device.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {device.isOnline ? t('online') : t('offline')}
                </p>
                {device.location.address && (
                  <p className="text-xs text-gray-500 mt-1">{device.location.address}</p>
                )}
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
};

export default DevicesMap;