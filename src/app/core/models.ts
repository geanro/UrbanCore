export type Role = 'ADMIN' | 'SUPERVISOR' | 'SELLER' | 'CUSTOMER';
export type SaleStatus = 'COMPLETED' | 'CANCELLED' | 'PENDING';

export interface LoginRequest { username: string; password: string; }
export interface RegisterRequest { name: string; username: string; password: string; }
export interface AuthResponse { jwt: string; }

export interface UserResponse {
  idUser: number;
  name: string;
  username: string;
  role: Role;
  active: boolean;
  branchId?: number | null;
  branchName?: string | null;
}
export interface UserRequest {
  name: string;
  username: string;
  password: string;
  role: Role;
  active?: boolean;
  branchId?: number | null;
}
export interface UpdateUserRequest { name?: string; role?: Role; active?: boolean; branchId?: number | null; }
export interface UpdateUserProfileRequest { name: string; }
export interface ChangePasswordRequest { currentPassword: string; newPassword: string; }

export interface BranchResponse { idBranch: number; name: string; address: string; phone: string; active: boolean; }
export interface BranchRequest { name: string; address: string; phone: string; active?: boolean; }

export interface CategoryResponse { idCategory: number; name: string; description?: string; active: boolean; }
export interface CategoryRequest { name: string; description?: string; active?: boolean; }

export interface ProductResponse {
  idProduct: number;
  name: string;
  description?: string;
  price: number;
  active: boolean;
  imageUrl?: string | null;
  categoryId: number;
  categoryName: string;
}
export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  active?: boolean;
  imageUrl?: string | null;
  categoryId: number;
}

export interface CatalogProductResponse extends ProductResponse { availableStock?: number; }

export interface BranchInventoryResponse {
  idInventory: number;
  branchId: number;
  branchName: string;
  productId: number;
  productName: string;
  stock: number;
}
export interface BranchInventoryRequest { branchId: number; productId: number; stock: number; }
export interface UpdateStockRequest { stock: number; }

export interface SaleDetailRequest { productId: number; quantity: number; }
export interface SaleRequest { branchId?: number | null; details: SaleDetailRequest[]; }
export interface SaleDetailResponse {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
export interface SaleResponse {
  idSale: number;
  userId: number;
  userName: string;
  branchId: number;
  branchName: string;
  saleDate: string;
  total: number;
  status: SaleStatus;
  details: SaleDetailResponse[];
}

export interface ErrorResponse {
  code?: string;
  message?: string;
  timestamp?: string;
  errors?: Record<string, string>;
}

export interface JwtSession {
  sub?: string;
  name?: string;
  role?: Role;
  permissions?: string[];
  exp?: number;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}
