import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function FieldMap({ lat, lng, name }) {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum)) {
    return (
      <div className="map-error-box">
        <span>🗺️</span>
        <p>Coordonate invalide pentru hartă.</p>
      </div>
    );
  }

  const center = [latNum, lngNum];

  return (
    <MapContainer
      key={`${latNum}-${lngNum}`}
      center={center}
      zoom={16}
      style={{
        width: "100%",
        height: "320px",
        borderRadius: "14px",
        border: "none",
        outline: "none",
        zIndex: 0,
      }}
      scrollWheelZoom={true}
    >
      <InvalidateSizeOnMount />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={center}>
        <Popup>
          <strong>{name || "Teren fotbal"}</strong>
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default FieldMap;
