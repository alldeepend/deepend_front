const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

type RegisterUser = {
	email: string;
	password: string;
	firstName: string;
	name: string;
	lastName: string;
	preferredName?: string;
	whatsapp: string;
	username?: string;
	categories?: number[];

	// Extended fields
	tipo_documento?: string;
	documento_identidad?: string;
	fecha_nacimiento?: string;
	genero?: string;
	estado_civil?: string;
	pais_residencia?: string;
	ciudad_residencia?: string;
	estado_residencia?: string;
	direccion_residencia?: string;
	codigo_postal?: string;
	telefono?: string;
	estatus_laboral?: string;
	nivel_educativo_actual?: string;
	rango_ingreso_mensual?: string;
	ingreso_mensual_hogar?: number;
	moneda_ingreso?: string;
	dependientes_economicos?: number;
	parentesco_dependientes?: string[]; // Assuming array of strings for multiple selection
	redes_sociales?: any; // Start precise, iterate if needed
}

export const userApi = {
	updateUserCategories: async (categoryIds: number[]) => {
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
		const data = await response.json();
		const user = JSON.parse(localStorage.getItem('user') || '{}');
		user.categories = data;
		localStorage.setItem('user', JSON.stringify(user));
		return data;
	},

	register: async (userData: RegisterUser) => {
		try {
			const response = await fetch(`${API_URL}/auth/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(userData)
			});

			if (!response.ok) {
				throw new Error('Error registering user');
			}
			const data = await response.json();
			localStorage.setItem('token', data.token);
			localStorage.setItem('user', JSON.stringify(data.user));
			return { success: true, user: data.user };
		} catch (error) {
			return { success: false };
		}
	},
	getNextActivity: async () => {
		const token = localStorage.getItem('token');
		const response = await fetch(`${API_URL}/user/next-activity`, {
			headers: { 'Authorization': `Bearer ${token}` }
		});
		return response.json();
	},
	setNextActivity: async (activityId: number | null) => {
		const token = localStorage.getItem('token');
		await fetch(`${API_URL}/user/next-activity`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({ activityId })
		});
	}
};

