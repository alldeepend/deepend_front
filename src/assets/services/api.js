
import { userApi } from './user';

// API unificada que mantiene la misma interfaz pública
export const api = {

	// User
	updateUserCategories: userApi.updateUserCategories
};
