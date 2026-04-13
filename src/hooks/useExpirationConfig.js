import { useState, useEffect } from 'react';

const CONFIG_KEY = 'myfryz_expiration_config';

export const useExpirationConfig = () => {
  const [config, setConfig] = useState(() => {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Erreur lecture config expiration', e);
    }
    // Valeurs par défaut
    return {
      enabled: false,
      level1Months: 3,
      level2Months: 6
    };
  });

  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }, [config]);

  return [config, setConfig];
};
