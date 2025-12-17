const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const userApi = {
	updateUserCategories: async (categoryIds) => {
		const token = localStorage.getItem('token');
		const response = await fetch(`${API_URL}/user/categories`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({ categoryIds })
		});
		if (!response.ok) {
			throw new Error('Error updating categories');
		}
		return response.json();
	}
};

