"use client";

import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from '@react-google-maps/api';
import type { IStore } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, MapPin } from 'lucide-react';

interface StoresMapProps {
  stores: IStore[];
}

// Google Maps container styles
const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem'
};

// Default center if no stores are available
const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060 // New York City
};

// Get the Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Default icon size
const DEFAULT_ICON_SIZE = 30;

export function StoresMap({ stores }: StoresMapProps) {
  const [selectedStore, setSelectedStore] = useState<IStore | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Load Google Maps API using the useJsApiLoader hook
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });
  
  // Function to fit all markers within the map bounds
  const fitBounds = useCallback(() => {
    if (!mapRef.current || !stores.length || !isLoaded) return;

    const bounds = new window.google.maps.LatLngBounds();
    
    // Add each store location to the bounds
    stores.forEach(store => {
      bounds.extend({ lat: store.lat, lng: store.lng });
    });

    // Fit the map to show all markers with proper padding
    mapRef.current.fitBounds(bounds, {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50
    });

    // If there's only one store, set a reasonable zoom level
    if (stores.length === 1) {
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.setZoom(15);
        }
      }, 100);
    }
  }, [stores, isLoaded]);

  // Effect to fit bounds when stores change
  useEffect(() => {
    if (isLoaded && stores.length > 0) {
      fitBounds();
    }
  }, [stores, isLoaded, fitBounds]);

  // Calculate initial center and zoom for when map loads
  const { center, zoom } = useMemo(() => {
    if (!stores.length) {
      return { center: defaultCenter, zoom: 10 };
    }

    // Calculate center from all store coordinates
    const lats = stores.map(store => store.lat);
    const lngs = stores.map(store => store.lng);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    return {
      center: {
        lat: (minLat + maxLat) / 2,
        lng: (minLng + maxLng) / 2
      },
      zoom: stores.length === 1 ? 15 : 10 // Use reasonable defaults
    };
  }, [stores]);

  // Fallback visualization when no API key or map errors
  const renderFallbackMap = () => (
    <div className="h-[400px] w-full bg-gray-100 rounded-md relative overflow-hidden">
      {/* Map visualization */}
      <div className="absolute inset-0">
        {stores.map((store) => {
          // Convert geographic coordinates to relative position in the container
          const x = Math.max(10, Math.min(90, (((store.lng - defaultCenter.lng) / 10) * 50) + 50));
          const y = Math.max(10, Math.min(90, 50 - (((store.lat - defaultCenter.lat) / 10) * 50)));
          
          return (
            <div
              key={store.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
            >
              <div className="flex flex-col items-center">
                <MapPin 
                  className="h-6 w-6 text-primary hover:text-primary/80 cursor-pointer" 
                  fill="rgba(0, 0, 0, 0.1)"
                />
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-8 bg-white p-2 rounded-md shadow-md text-xs z-10 w-max max-w-[160px]">
                  <div className="font-semibold">{store.name}</div>
                  <div>{store.city}, {store.state}</div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Add a note about the visualization */}
        <div className="absolute bottom-1 right-1 bg-white/80 text-xs p-1 rounded text-muted-foreground">
          This is a simplified map visualization of store locations.
        </div>
      </div>
    </div>
  );

  if (!stores.length) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Store Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground bg-muted/10 rounded-md">
            No stores found to display on map
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show fallback map if no API key provided
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Store Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Google Maps API Key Missing</AlertTitle>
            <AlertDescription>
              To display the interactive map, provide a Google Maps API key in your environment variables.
            </AlertDescription>
          </Alert>
          {renderFallbackMap()}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Store Locations</CardTitle>
      </CardHeader>
      <CardContent>
        {loadError ? (
          <div>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Map</AlertTitle>
              <AlertDescription>
                There was an error loading Google Maps. Please try again later.
              </AlertDescription>
            </Alert>
            {renderFallbackMap()}
          </div>
        ) : !isLoaded ? (
          <div className="h-[400px] w-full flex items-center justify-center bg-muted/10 rounded-md">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={zoom}
            onLoad={(map) => {
              mapRef.current = map;
              fitBounds();
            }}
            options={{
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
              zoomControl: true,
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }],
                },
              ],
            }}
          >
            {stores.map((store) => (
              <MarkerF
                key={store.id}
                position={{ lat: store.lat, lng: store.lng }}
                onClick={() => setSelectedStore(store)}
                icon={{
                  url: '/imgs/trace-icon-dark.png',
                  scaledSize: isLoaded ? new window.google.maps.Size(DEFAULT_ICON_SIZE, DEFAULT_ICON_SIZE) : undefined
                }}
              />
            ))}
            
            {selectedStore && (
              <InfoWindowF
                position={{ lat: selectedStore.lat, lng: selectedStore.lng }}
                onCloseClick={() => setSelectedStore(null)}
              >
                <div className="p-2 max-w-[250px]">
                  <h3 className="font-semibold text-base">{selectedStore.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedStore.address1}</p>
                  {selectedStore.address2 && (
                    <p className="text-sm text-gray-600">{selectedStore.address2}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    {selectedStore.city}, {selectedStore.state} {selectedStore.zip}
                  </p>
                  {selectedStore.description && (
                    <p className="text-sm mt-2 text-gray-700">{selectedStore.description}</p>
                  )}
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        )}
      </CardContent>
    </Card>
  );
}