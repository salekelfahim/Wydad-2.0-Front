import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player } from "../interfaces/player";

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

  getPlayerById(id: number): Observable<Player> {
    return this.http.get<Player>(`${this.apiUrl}/${id}`);
  }

  updatePlayer(id: number, player: Player, image: File | null): Observable<Player> {
    const formData = new FormData();
    formData.append('player', new Blob([JSON.stringify(player)], { type: 'application/json' }));

    if (image) {
      formData.append('image', image, image.name);
    }

    for (const pair of (formData as any).entries()) {
      console.log(pair[0], pair[1]);
    }

    return this.http.put<Player>(`${this.apiUrl}/${id}/update`, formData);
  }

  deletePlayer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
