export type LoginType = {
    email: string;
    password: string;
};

export type RegisterType = {
    email: string;
    password: string;
    name: string;
    avatar?: string;
};

export type AuthUser = {
    _id: string;
    name: string;
    email: string;
    avatar?: string | null;
    isAdmin?: boolean;
    githubConnected?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type AuthResponse = {
    message: string;
    user: AuthUser;
};

export type AddressType = {
  _id: string;
  userId: string;
  recipientName?: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAddressInput = {
  recipientName?: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
};

export type AddressResponse = {
  message: string;
  address: AddressType;
};

export type GetAddressesResponse = {
  message: string;
  addresses: AddressType[];
};


