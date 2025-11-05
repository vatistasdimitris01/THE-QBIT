import React, { useState, useEffect } from 'react';

interface WeatherData {
    time: string;
    weather: {
        description: string;
        temperature: string;
        icon: string;
    };
}

const Weather: React.FC = () => {
    const [data, setData] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Το Geolocation δεν υποστηρίζεται.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(`/api/weather-time?lat=${latitude}&lon=${longitude}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch weather data");
                    }
                    const weatherData: WeatherData = await response.json();
                    setData(weatherData);
                } catch (e) {
                    setError("Δεν ήταν δυνατή η λήψη δεδομένων καιρού.");
                }
            },
            () => {
                setError("Η πρόσβαση στην τοποθεσία απορρίφθηκε.");
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 1000 * 60 * 15 // 15 minutes cache
            }
        );
    }, []);

    if (error) {
        return <div className="text-xs text-stone-500 font-sans hidden sm:block" title={error}>—</div>;
    }

    if (!data) {
        return <div className="text-xs text-stone-500 font-sans hidden sm:block">Φόρτωση...</div>;
    }

    return (
        <div className="hidden sm:flex items-center gap-2 text-sm text-stone-700" title={`${data.weather.description} στην τοποθεσία σας`}>
            <span>{data.weather.icon}</span>
            <span className="font-medium">{data.weather.temperature}</span>
            <span className="text-stone-300">|</span>
            <span className="font-medium">{data.time}</span>
        </div>
    );
};

export default Weather;