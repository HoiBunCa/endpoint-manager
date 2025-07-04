import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Device } from '../../types';
import { MapPin, Navigation, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from '../../hooks/useTranslation'; // Import useTranslation

// Fix for default markers
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper function to safely format date distance
const safeFormatDistanceToNow = (dateString: string | undefined, addSuffix: boolean = true) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'N/A' : formatDistanceToNow(date, { addSuffix });
};

interface DeviceMapProps {
  device: Device;
}

const DeviceMap: React.FC<DeviceMapProps> = ({ device }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [mapRef, setMapRef] = useState<any>(null);
  const { t } = useTranslation(); // Use translation hook

  const currentLocationIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const historyIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
    shadowSize: [33, 33]
  });

  const centerToCurrentLocation = () => {
    if (mapRef && device.location) {
      mapRef.setView([device.location.latitude, device.location.longitude], 15);
    }
  };

  if (!device.location) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t('no_location_data_available')}</p>
        </div>
      </div>
    );
  }

  const mapCenter: [number, number] = [device.location.latitude, device.location.longitude];
  
  // Create path from location history
  const historyPath = device.locationHistory?.map(loc => [loc.latitude, loc.longitude] as [number, number]) || [];

  return (
    <div className="relative w-full h-full">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <button
          onClick={centerToCurrentLocation}
          className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          title={t('center_to_current_location')}
        >
          <Navigation className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">{t('center')}</span>
        </button>
        
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-all ${
            showHistory 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700'
          }`}
          title={t('toggle_location_history')}
        >
          <History className="w-4 h-4" />
          <span className="text-sm font-medium">{t('history')}</span>
        </button>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        ref={setMapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Current Location */}
        <Marker
          position={mapCenter}
          icon={currentLocationIcon}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-medium">{device.hostname}</h3>
              <p className="text-sm text-gray-600">{t('current_location')}</p>
              {device.location.address && (
                <p className="text-sm text-gray-600">{device.location.address}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {t('last_seen')}: {safeFormatDistanceToNow(device.lastSeen)}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Location History */}
        {showHistory && device.locationHistory && device.locationHistory.length > 0 && (
          <>
            {/* History markers */}
            {device.locationHistory.map((location, index) => (
              <Marker
                key={index}
                position={[location.latitude, location.longitude]}
                icon={historyIcon}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-medium">{t('historical_location')}</h3>
                    <p className="text-sm text-gray-600">
                      {safeFormatDistanceToNow(location.timestamp)}
                    </p>
                    {location.address && (
                      <p className="text-sm text-gray-600">{location.address}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Path line */}
            {historyPath.length > 1 && (
              <Polyline
                positions={historyPath}
                color="blue"
                weight={3}
                opacity={0.7}
                dashArray="5, 10"
              />
            )}
          </>
        )}
      </MapContainer>

      {/* Location Info */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">{t('current_location')}</span>
        </div>
        <p className="text-sm text-gray-600">
          {device.location.address || `${device.location.latitude.toFixed(6)}, ${device.location.longitude.toFixed(6)}`}
        </p>
        <p className="text-xs text-gray-500">
          {t('last_updated')}: {safeFormatDistanceToNow(device.lastSeen)}
        </p>
      </div>
    </div>
  );
};

export default DeviceMap;