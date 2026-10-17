import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api/diagrams';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const diagramApi = {
  // Create a new diagram or save existing
  saveDiagram: async (diagramData) => {
    try {
      const response = await api.post('/', diagramData);
      return response.data;
    } catch (error) {
      console.error('Error saving diagram:', error);
      throw error;
    }
  },

  // Get all diagrams
  getAllDiagrams: async (userId) => {
    try {
      const params = userId ? { userId } : {};
      const response = await api.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all diagrams:', error);
      throw error;
    }
  },

  // Get a specific diagram by ID
  getDiagram: async (diagramId) => {
    try {
      const response = await api.get(`/${diagramId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching diagram:', error);
      throw error;
    }
  },

  // Update a diagram by ID
  updateDiagram: async (diagramId, diagramData) => {
    try {
      const response = await api.put(`/${diagramId}`, diagramData);
      return response.data;
    } catch (error) {
      console.error('Error updating diagram:', error);
      throw error;
    }
  },

};
