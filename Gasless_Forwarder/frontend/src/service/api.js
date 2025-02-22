const API_URL = 'http://localhost:5000/api';

export const saveReceipt = async (receiptData) => {
  try {
    const response = await fetch(`${API_URL}/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(receiptData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save receipt');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving receipt:', error);
    throw error;
  }
};

export const getReceiptsByAddress = async (address) => {
  try {
    const response = await fetch(`${API_URL}/receipts/address/${address}`);
    if (!response.ok) {
      throw new Error('Failed to fetch receipts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching receipts:', error);
    throw error;
  }
};