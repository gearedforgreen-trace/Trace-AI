"use client";

import React, { useState, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import type { IStore } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, MapPin } from 'lucide-react';

interface StoresMapProps {
  stores: IStore[];
}

// Default viewport settings
const DEFAULT_VIEWPORT = {
  latitude: 40.7128,
  longitude: -74.0060,
  zoom: 10
};

// Mapbox access token from environment variables
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export function StoresMapMapbox({ stores }: StoresMapProps) {
  const [selectedStore, setSelectedStore] = useState<IStore | null>(null);
  const [viewport, setViewport] = useState<any>(null);

  // Filter out stores with invalid coordinates (0,0 or clearly wrong coordinates)
  const validStores = useMemo(() => {
    return stores.filter(store => {
      // Filter out stores with coordinates 0,0 or coordinates outside reasonable US bounds
      const hasValidCoords = store.lat !== 0 && store.lng !== 0;
      const withinUSBounds = store.lat >= 24.7 && store.lat <= 49.4 && 
                            store.lng >= -125.0 && store.lng <= -66.9;
      
      if (!hasValidCoords || !withinUSBounds) {
        console.warn(`Store "${store.name}" has invalid coordinates: lat=${store.lat}, lng=${store.lng}`);
        return false;
      }
      return true;
    });
  }, [stores]);

  // Calculate initial viewport based on valid stores with smart clustering
  const initialViewport = useMemo(() => {
    if (!validStores.length) {
      return DEFAULT_VIEWPORT;
    }

    // For single store, center on it with high zoom
    if (validStores.length === 1) {
      return {
        latitude: validStores[0].lat,
        longitude: validStores[0].lng,
        zoom: 15
      };
    }

    // Calculate bounds from valid store coordinates
    const lats = validStores.map(store => store.lat);
    const lngs = validStores.map(store => store.lng);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    // Calculate spans to determine if stores are spread across country
    const latSpan = maxLat - minLat;
    const lngSpan = maxLng - minLng;
    const maxSpan = Math.max(latSpan, lngSpan);

    // If stores are spread across large area (>10 degrees), use fitBounds approach
    if (maxSpan > 10) {
      // Add padding to bounds (10% on each side)
      const latPadding = latSpan * 0.1;
      const lngPadding = lngSpan * 0.1;
      
      const paddedMinLat = Math.max(minLat - latPadding, 24.7); // Don't go below US bounds
      const paddedMaxLat = Math.min(maxLat + latPadding, 49.4); // Don't go above US bounds
      const paddedMinLng = Math.max(minLng - lngPadding, -125.0);
      const paddedMaxLng = Math.min(maxLng + lngPadding, -66.9);
      
      return {
        latitude: (paddedMinLat + paddedMaxLat) / 2,
        longitude: (paddedMinLng + paddedMaxLng) / 2,
        zoom: 4 // Lower zoom to show wider area
      };
    }

    // For stores in same general area, calculate center and appropriate zoom
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Calculate zoom level based on spread
    let zoom = 10;
    if (maxSpan < 0.01) zoom = 15;        // Very close together
    else if (maxSpan < 0.1) zoom = 12;    // Same city/area  
    else if (maxSpan < 1) zoom = 9;       // Same region
    else if (maxSpan < 5) zoom = 7;       // Same state
    else zoom = 5;                        // Multiple states

    return {
      latitude: centerLat,
      longitude: centerLng,
      zoom
    };
  }, [validStores]);

  // Fallback visualization when no API key
  const renderFallbackMap = () => (
    <div className="h-[400px] w-full bg-gray-100 rounded-md relative overflow-hidden">
      {validStores.map((store) => {
        // Convert geographic coordinates to relative position in the container
        const x = Math.max(10, Math.min(90, (((store.lng - DEFAULT_VIEWPORT.longitude) / 10) * 50) + 50));
        const y = Math.max(10, Math.min(90, 50 - (((store.lat - DEFAULT_VIEWPORT.latitude) / 10) * 50)));
        
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
      
      <div className="absolute bottom-1 right-1 bg-white/80 text-xs p-1 rounded text-muted-foreground">
        Simplified map view - Mapbox API key required for interactive panning and zooming
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
  if (!MAPBOX_ACCESS_TOKEN) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Store Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Mapbox Access Token Missing</AlertTitle>
            <AlertDescription>
              To display the interactive map, provide a Mapbox access token in your environment variables (NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN).
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
        <div className="h-[400px] w-full rounded-md overflow-hidden">
          <Map
            {...initialViewport}
            {...(viewport && viewport)}
            onMove={evt => setViewport(evt.viewState)}
            mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
            style={{width: '100%', height: '100%'}}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            attributionControl={false}
            interactiveLayerIds={[]}
            dragPan={true}
            dragRotate={true}
            scrollZoom={true}
            boxZoom={true}
            doubleClickZoom={true}
            keyboard={true}
            touchZoom={true}
            touchRotate={true}
          >
            <NavigationControl position="bottom-right" showCompass={false} />
            
            {validStores.map((store) => (
              <Marker
                key={store.id}
                latitude={store.lat}
                longitude={store.lng}
                onClick={() => setSelectedStore(store)}
              >
                <div className="cursor-pointer transform hover:scale-110 transition-transform">
                  <MapPin 
                    className="h-6 w-6 text-primary hover:text-primary/80" 
                    fill="currentColor"
                  />
                </div>
              </Marker>
            ))}
            
            {selectedStore && (
              <Popup
                latitude={selectedStore.lat}
                longitude={selectedStore.lng}
                onClose={() => setSelectedStore(null)}
                closeButton={true}
                closeOnClick={false}
                offsetTop={-10}
                className="mapbox-popup"
              >
                <div className="p-3 max-w-[250px]">
                  <h3 className="font-semibold text-base mb-2">{selectedStore.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{selectedStore.address1}</p>
                    {selectedStore.address2 && (
                      <p>{selectedStore.address2}</p>
                    )}
                    <p>
                      {selectedStore.city}, {selectedStore.state} {selectedStore.zip}
                    </p>
                    {selectedStore.description && (
                      <p className="mt-2 text-gray-700">{selectedStore.description}</p>
                    )}
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      </CardContent>
    </Card>
  );
}