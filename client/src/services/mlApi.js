import api from './api';

export const predictDisease = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/ml/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
};
