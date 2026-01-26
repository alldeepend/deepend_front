type User = {
  id: string;
  email: string;
  password: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  preferredName: string | null;
  username: string | null;
  whatsapp: string | null;
  avatar: string | null;
  fecha_nacimiento: string | null;
  pais_residencia: string | null;
  ciudad_residencia: string | null;
  createdAt: string;
}

type AppComment = {
  id: number;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name?: string;
    preferredName?: string;
    avatar?: string;
  };
}