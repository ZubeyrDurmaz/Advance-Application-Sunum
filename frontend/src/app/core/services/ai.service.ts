import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProductRecommendation {
  name: string;
  ref: string;
  price: string;
  image: string | null;
}

export interface AiResponse {
  text: string;
  recommendations: ProductRecommendation[] | null;
  followUp: string | null;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  query(message: string, history: ConversationMessage[]): Observable<AiResponse> {
    return this.http.post<AiResponse>(`${this.api}/ai/query`, { message, history });
  }
}
