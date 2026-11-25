import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('managerToken') || '';
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // --- المنتجات ---
  getPublicItems(): Observable<any> {
    return this.http.get(`${this.baseUrl}/items/public`);
  }

  getProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/items/manager`, { headers: this.getAuthHeaders() });
  }

  createProduct(productData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/items`, productData, { headers: this.getAuthHeaders() });
  }

  // تم استبدال الحذف النهائي بدالة تفعيل وتعطيل المنتج (Active / Deactive)
  toggleProductStatus(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/items/${id}/toggle-status`, {}, { headers: this.getAuthHeaders() });
  }

  // (اختياري لو محتاج تحتفظ بدالة الحذف القديمة)
  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/items/${id}`, { headers: this.getAuthHeaders() });
  }

  // --- الطلبات ---
  getOrders(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/orders/manager`, { headers: this.getAuthHeaders(), params });
  }

  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/orders`, orderData);
  }

  

  updateOrderStatus(orderId: string, statusData: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/orders/${orderId}/status`, statusData, { headers: this.getAuthHeaders() });
  }

  // تحديث ملاحظات الطلب (سجل الملاحظات التاريخي باستخدام POST)
  updateOrderNotes(orderId: string, notesData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/orders/${orderId}/notes`, notesData, { headers: this.getAuthHeaders() });
  }

  // --- المصادقة ---
  adminLogin(credentials: { username: string, password: string }):Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials);
  }
  getPaidOrder(sessionId: string): Observable<any> {
  return this.http.get(
    `${this.baseUrl}/orders/checkout-session/${encodeURIComponent(sessionId)}`
  );
}
}