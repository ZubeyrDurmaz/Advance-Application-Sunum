import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReviewResponse, ReviewRequest } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getProductReviews(productId: string): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${this.apiUrl}/product/${productId}`);
  }

  submitReview(productId: string, review: ReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${this.apiUrl}/product/${productId}`, review);
  }
}
