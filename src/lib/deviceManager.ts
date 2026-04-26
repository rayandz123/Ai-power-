export const deviceManager = {
  vibrate: (pattern: number | number[] = 200) => {
    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
      return { status: "success", message: "Device vibrated successfully" };
    }
    return { status: "error", message: "Vibration not supported on this device" };
  },

  getBattery: async () => {
    try {
      if ("getBattery" in navigator) {
        const battery: any = await (navigator as any).getBattery();
        return {
          level: Math.round(battery.level * 100),
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
        };
      }
      return { status: "error", message: "Battery status not supported" };
    } catch (e) {
      return { status: "error", message: "Could not access battery info" };
    }
  },

  getDeviceInfo: () => {
    const ua = navigator.userAgent;
    const platform = (navigator as any).platform || "Unknown";
    const language = navigator.language;
    return {
      os: platform,
      browser: ua,
      language: language,
      timestamp: new Date().toLocaleTimeString(),
    };
  },

  setFlashlight: async (enabled: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const track = stream.getVideoTracks()[0];
      const capabilities = (track as any).getCapabilities?.();
      
      if (capabilities?.torch) {
        await (track as any).applyConstraints({
          advanced: [{ torch: enabled }]
        });
        if (!enabled) stream.getTracks().forEach(t => t.stop());
        return { success: true, status: enabled ? "on" : "off" };
      }
      return { success: false, error: "Flashlight not supported/not allowed" };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  sendNotification: async (title: string, body: string) => {
    if (!("Notification" in window)) return { status: "error", message: "Notifications not supported" };
    
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    
    if (permission === "granted") {
      new Notification(title, { body, icon: "/pwa-192x192.png" });
      return { status: "success" };
    }
    return { status: "error", message: "Permission denied" };
  },

  copyToClipboard: async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return { status: "success" };
    } catch (e) {
      return { status: "error", message: "Clipboard access failed" };
    }
  },

  getLocation: async () => {
    if (!("geolocation" in navigator)) return { status: "error", message: "GPS not supported" };
    
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy
      };
    } catch (e) {
      return { status: "error", message: "GPS access denied" };
    }
  }
};
