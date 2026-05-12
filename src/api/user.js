import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await axios.get(`${API_BASE_URL}/user/profile`);
    return response.data;
  },
  
  // Update user profile
  updateProfile: async (userData) => {
    const response = await axios.put(`${API_BASE_URL}/user/profile`, userData);
    return response.data;
  },
  
  // Get user balance
  getBalance: async () => {
    const response = await axios.get(`${API_BASE_URL}/user/balance`);
    return response.data;
  },
  
  // Update user balance (admin only)
  updateBalance: async (userId, balance) => {
    const response = await axios.patch(`${API_BASE_URL}/user/${userId}/balance`, { balance });
    return response.data;
  },
  
  // Get user cards
  getCards: async () => {
    const response = await axios.get(`${API_BASE_URL}/user/cards`);
    return response.data;
  },
  
  // Get user transactions
  getTransactions: async () => {
    const response = await axios.get(`${API_BASE_URL}/user/transactions`);
    return response.data;
  },
  
  // Create transaction
  createTransaction: async (transactionData) => {
    const response = await axios.post(`${API_BASE_URL}/user/transactions`, transactionData);
    return response.data;
  },
  
  // Freeze/unfreeze card
  toggleCardStatus: async (cardId, isFrozen) => {
    const response = await axios.patch(`${API_BASE_URL}/user/cards/${cardId}/toggle`, { isFrozen });
    return response.data;
  }
};

export default userService;