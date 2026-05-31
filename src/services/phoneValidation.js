const ABSTRACT_API_KEY = import.meta.env.VITE_ABSTRACT_API_KEY;
const API_URL = 'https://phonevalidation.abstractapi.com/v1/';

export const validatePhone = async (phone) => {
  if (!ABSTRACT_API_KEY) {
    console.warn('No Abstract API key provided, skipping validation.');
    // fallback logic to not block testing
    return { valid: true, formatted: phone, type: 'mobile' };
  }

  // Check cache first
  const cacheKey = `lumen_phone_val_${phone}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // ignore
    }
  }

  try {
    const url = `${API_URL}?api_key=${ABSTRACT_API_KEY}&phone=${encodeURIComponent(phone)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    
    const result = {
      valid: data.valid,
      formatted: data.format?.international || phone,
      country: data.country?.name,
      type: data.type,
      carrier: data.carrier
    };

    // Cache the result
    localStorage.setItem(cacheKey, JSON.stringify(result));
    
    return result;
  } catch (error) {
    console.error('Phone validation error:', error);
    // Return a default valid state on error so we don't completely block the user if the API is down
    return { valid: true, formatted: phone, type: 'unknown', error: true };
  }
};
