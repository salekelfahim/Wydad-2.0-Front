import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../interfaces/ticket';
import {AbstractControl, ValidationErrors} from "@angular/forms";

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private apiUrl = 'http://localhost:8089/api/tickets';

  constructor(private http: HttpClient) {}

  createTicket(ticket: {
    price: any;
    quantity: any;
    category: any;
    game: { id: (string | ((control: AbstractControl) => (ValidationErrors | null)))[] }
  }): Observable<Ticket> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    console.log('Sending Ticket:', ticket); // Log the ticket being sent
    return this.http.post<Ticket>(this.apiUrl, ticket, { headers });
  }

  getAllTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }

  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
