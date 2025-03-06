import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Player} from "../interfaces/player";

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private apiUrl = 'http://localhost:8089/api/players';

  constructor(private http: HttpClient) {}

  createPlayer(player: Player, image: File): Observable<Player> {
    const formData = new FormData();
    formData.append('player', new Blob([JSON.stringify(player)], { type: 'application/json' }));
    formData.append('image', image, image.name);
    return this.http.post<Player>(`${this.apiUrl}/save`, formData);
  }

  getAllPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(this.apiUrl);
  }
}
