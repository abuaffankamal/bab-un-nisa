import React, { useEffect, useState } from "react";
import earthImage from "../assets/earth.png";
import arrowImage from "../assets/arrow.png";
import "./Qibla.css"; // if you use a stylesheet

const QIBLA_LAT = 21.4225;
const QIBLA_LON = 39.8262;

const toRadians = (deg: number) => (deg * Math.PI) / 180;

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of Earth in KM
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Qibla = () => {
  const [direction, setDirection] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        // Calculate direction
        const dLon = toRadians(QIBLA_LON - longitude);
        const y = Math.sin(dLon) * Math.cos(toRadians(QIBLA_LAT));
        const x =
          Math.cos(toRadians(latitude)) * Math.sin(toRadians(QIBLA_LAT)) -
          Math.sin(toRadians(latitude)) *
            Math.cos(toRadians(QIBLA_LAT)) *
            Math.cos(dLon);
        const angle = (Math.atan2(y, x) * 180) / Math.PI;
        const qiblaDirection = (angle + 360) % 360;
        setDirection(qiblaDirection);

        // Calculate distance
        const dist = haversineDistance(latitude, longitude, QIBLA_LAT, QIBLA_LON);
        setDistance(dist);

        // Get location info using OpenCage API (you need a real API key)
        const apiKey = "YOUR_OPENCAGE_API_KEY";
        try {
          const res = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`
          );
          const data = await res.json();
          if (data.results.length > 0) {
            const { city, town, country } = data.results[0].components;
            setLocationName(`${city || town}, ${country}`);
          }
        } catch (err) {
          console.error("Failed to fetch location name", err);
        }
      });
    }
  }, []);

  return (
    <div className="qibla-container">
      <h2 style={{ fontWeight: "bold", textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}>
        Qibla Direction
      </h2>
      {direction !== null ? (
        <>
          <div className="earth-container">
            <img src={earthImage} alt="Earth" className="earth-image" />
            <img
              src={arrowImage}
              alt="Qibla Arrow"
              className="arrow-image"
              style={{ transform: `rotate(${direction}deg)` }}
            />
          </div>
          <div className="info">
            <p><strong>Location:</strong> {locationName || "Detecting..."}</p>
            <p><strong>Distance to Mecca:</strong> {distance?.toFixed(2)} km</p>
            <p><strong>Direction:</strong> {direction.toFixed(2)}°</p>
          </div>
        </>
      ) : (
        <p>Detecting location...</p>
      )}
    </div>
  );
};

export default Qibla;
