import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BranchInventoryRequest, BranchInventoryResponse, BranchRequest, BranchResponse,
  CatalogProductResponse, CategoryRequest, CategoryResponse, ChangePasswordRequest,
  ProductRequest, ProductResponse, SaleRequest, SaleResponse, SaleStatus,
  UpdateStockRequest, UpdateUserProfileRequest, UpdateUserRequest, UserRequest, UserResponse, Role
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // Catalog público
  getCatalogProducts(): Observable<CatalogProductResponse[]> { return this.http.get<CatalogProductResponse[]>(`${this.apiUrl}/catalog/products`); }
  searchCatalogProducts(name: string): Observable<CatalogProductResponse[]> { return this.http.get<CatalogProductResponse[]>(`${this.apiUrl}/catalog/products/search`, { params: { name } }); }
  getCatalogProduct(idProduct: number): Observable<CatalogProductResponse> { return this.http.get<CatalogProductResponse>(`${this.apiUrl}/catalog/products/${idProduct}`); }
  getCatalogCategories(): Observable<CategoryResponse[]> { return this.http.get<CategoryResponse[]>(`${this.apiUrl}/catalog/categories`); }
  getCatalogBranches(): Observable<BranchResponse[]> {return this.http.get<BranchResponse[]>(`${this.apiUrl}/catalog/branches`);}
  getCatalogStock(idProduct: number): Observable<number> { return this.http.get<number>(`${this.apiUrl}/catalog/products/${idProduct}/stock`); }

  // Branches
  getBranches(): Observable<BranchResponse[]> { return this.http.get<BranchResponse[]>(`${this.apiUrl}/branches`); }
  getActiveBranches(): Observable<BranchResponse[]> { return this.http.get<BranchResponse[]>(`${this.apiUrl}/branches/active`); }
  searchBranches(name: string): Observable<BranchResponse[]> { return this.http.get<BranchResponse[]>(`${this.apiUrl}/branches/search`, { params: { name } }); }
  getBranch(id: number): Observable<BranchResponse> { return this.http.get<BranchResponse>(`${this.apiUrl}/branches/${id}`); }
  createBranch(body: BranchRequest): Observable<BranchResponse> { return this.http.post<BranchResponse>(`${this.apiUrl}/branches`, body); }
  updateBranch(id: number, body: BranchRequest): Observable<BranchResponse> { return this.http.put<BranchResponse>(`${this.apiUrl}/branches/${id}`, body); }
  deleteBranch(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/branches/${id}`); }

  // Categories
  getCategories(): Observable<CategoryResponse[]> { return this.http.get<CategoryResponse[]>(`${this.apiUrl}/categories`); }
  getActiveCategories(): Observable<CategoryResponse[]> { return this.http.get<CategoryResponse[]>(`${this.apiUrl}/categories/active`); }
  searchCategories(name: string): Observable<CategoryResponse[]> { return this.http.get<CategoryResponse[]>(`${this.apiUrl}/categories/search`, { params: { name } }); }
  createCategory(body: CategoryRequest): Observable<CategoryResponse> { return this.http.post<CategoryResponse>(`${this.apiUrl}/categories`, body); }
  updateCategory(id: number, body: CategoryRequest): Observable<CategoryResponse> { return this.http.put<CategoryResponse>(`${this.apiUrl}/categories/${id}`, body); }
  deleteCategory(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/categories/${id}`); }

  // Products
  getProducts(): Observable<ProductResponse[]> { return this.http.get<ProductResponse[]>(`${this.apiUrl}/products`); }
  getActiveProducts(): Observable<ProductResponse[]> { return this.http.get<ProductResponse[]>(`${this.apiUrl}/products/active`); }
  searchProducts(name: string): Observable<ProductResponse[]> { return this.http.get<ProductResponse[]>(`${this.apiUrl}/products/search`, { params: { name } }); }
  getProductsByCategory(idCategory: number): Observable<ProductResponse[]> { return this.http.get<ProductResponse[]>(`${this.apiUrl}/products/category/${idCategory}`); }
  getTopExpensiveProducts(): Observable<ProductResponse[]> { return this.http.get<ProductResponse[]>(`${this.apiUrl}/products/top-expensive`); }
  getProductsByPriceBetween(initialPrice: number, finalPrice: number): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.apiUrl}/products/price-between`, { params: { initialPrice, finalPrice } as any });
  }
  createProduct(body: ProductRequest): Observable<ProductResponse> { return this.http.post<ProductResponse>(`${this.apiUrl}/products`, body); }
  updateProduct(id: number, body: ProductRequest): Observable<ProductResponse> { return this.http.put<ProductResponse>(`${this.apiUrl}/products/${id}`, body); }
  deleteProduct(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/products/${id}`); }

  // Inventory
  getInventory(): Observable<BranchInventoryResponse[]> { return this.http.get<BranchInventoryResponse[]>(`${this.apiUrl}/inventory`); }
  getMyBranchInventory(): Observable<BranchInventoryResponse[]> { return this.http.get<BranchInventoryResponse[]>(`${this.apiUrl}/inventory/my-branch`); }
  getInventoryByBranch(idBranch: number): Observable<BranchInventoryResponse[]> { return this.http.get<BranchInventoryResponse[]>(`${this.apiUrl}/inventory/branch/${idBranch}`); }
  getInventoryByProduct(idProduct: number): Observable<BranchInventoryResponse[]> { return this.http.get<BranchInventoryResponse[]>(`${this.apiUrl}/inventory/product/${idProduct}`); }
  getLowStock(stock: number): Observable<BranchInventoryResponse[]> { return this.http.get<BranchInventoryResponse[]>(`${this.apiUrl}/inventory/low-stock`, { params: { stock } as any }); }
  createInventory(body: BranchInventoryRequest): Observable<BranchInventoryResponse> { return this.http.post<BranchInventoryResponse>(`${this.apiUrl}/inventory`, body); }
  updateStock(idInventory: number, body: UpdateStockRequest): Observable<BranchInventoryResponse> { return this.http.put<BranchInventoryResponse>(`${this.apiUrl}/inventory/${idInventory}/stock`, body); }
  deleteInventory(idInventory: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/inventory/${idInventory}`); }

  // Users
  getMyProfile(): Observable<UserResponse> { return this.http.get<UserResponse>(`${this.apiUrl}/users/me`); }
  getUsers(): Observable<UserResponse[]> { return this.http.get<UserResponse[]>(`${this.apiUrl}/users`); }
  getUser(id: number): Observable<UserResponse> { return this.http.get<UserResponse>(`${this.apiUrl}/users/${id}`); }
  getUsersByRole(role: Role): Observable<UserResponse[]> { return this.http.get<UserResponse[]>(`${this.apiUrl}/users/role`, { params: { role } }); }
  getActiveUsers(): Observable<UserResponse[]> { return this.http.get<UserResponse[]>(`${this.apiUrl}/users/active`); }
  getUsersByBranch(idBranch: number): Observable<UserResponse[]> { return this.http.get<UserResponse[]>(`${this.apiUrl}/users/branch/${idBranch}`); }
  createUser(body: UserRequest): Observable<UserResponse> { return this.http.post<UserResponse>(`${this.apiUrl}/users`, body); }
  updateUser(idUser: number, body: UpdateUserRequest): Observable<UserResponse> { return this.http.patch<UserResponse>(`${this.apiUrl}/users/${idUser}`, body); }
  updateMyProfile(body: UpdateUserProfileRequest): Observable<UserResponse> { return this.http.patch<UserResponse>(`${this.apiUrl}/users/me`, body); }
  changePassword(body: ChangePasswordRequest): Observable<void> { return this.http.patch<void>(`${this.apiUrl}/users/me/password`, body); }
  deleteUser(idUser: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/users/${idUser}`); }

  // Sales
  getSales(): Observable<SaleResponse[]> { return this.http.get<SaleResponse[]>(`${this.apiUrl}/sales`); }
  getMySales(): Observable<SaleResponse[]> { return this.http.get<SaleResponse[]>(`${this.apiUrl}/sales/me`); }
  getMyBranchSales(): Observable<SaleResponse[]> { return this.http.get<SaleResponse[]>(`${this.apiUrl}/sales/my-branch`); }
  getSalesByUser(idUser: number): Observable<SaleResponse[]> { return this.http.get<SaleResponse[]>(`${this.apiUrl}/sales/user/${idUser}`); }
  getSalesByBranch(idBranch: number): Observable<SaleResponse[]> { return this.http.get<SaleResponse[]>(`${this.apiUrl}/sales/branch/${idBranch}`); }
  getSalesByStatus(status: SaleStatus): Observable<SaleResponse[]> { return this.http.get<SaleResponse[]>(`${this.apiUrl}/sales/status`, { params: { status } }); }
  getSalesByDateBetween(start: string, end: string): Observable<SaleResponse[]> { return this.http.get<SaleResponse[]>(`${this.apiUrl}/sales/date-between`, { params: { start, end } }); }
  getTopSales(): Observable<SaleResponse[]> { return this.http.get<SaleResponse[]>(`${this.apiUrl}/sales/top-sale`); }
  createSale(body: SaleRequest): Observable<SaleResponse> { return this.http.post<SaleResponse>(`${this.apiUrl}/sales`, body); }
  cancelSale(idSale: number): Observable<SaleResponse> { return this.http.put<SaleResponse>(`${this.apiUrl}/sales/${idSale}/cancel`, {}); }
}
