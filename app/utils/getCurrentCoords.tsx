export type Coordinates = {
  latitude: number;
  longitude: number;
};

export const getCurrentCoords = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Geolocation is only available in browser"));
      return;
    }

    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location permission denied"));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location unavailable"));
            break;
          case error.TIMEOUT:
            reject(new Error("Location request timed out"));
            break;
          default:
            reject(new Error("Failed to get location"));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};
