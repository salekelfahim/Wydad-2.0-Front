import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlayerService } from "../../../services/player.service";
import { Player } from "../../../interfaces/player";
import { MatIconModule } from "@angular/material/icon";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-player',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIconModule],
  templateUrl: './edit-player.component.html',
  styleUrls: ['./edit-player.component.css'],
})
export class EditPlayerComponent implements OnInit {
  playerForm: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;
  playerId: number;
  currentPlayer: Player | null = null;
  pictureUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private playerService: PlayerService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.playerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthday: ['', Validators.required],
      nationality: ['', Validators.required],
      number: ['', [Validators.required, Validators.min(1), Validators.max(99)]],
      position: ['', Validators.required],
    });

    this.playerId = +this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loadPlayerData();
  }

  loadPlayerData(): void {
    this.playerService.getPlayerById(this.playerId).subscribe({
      next: (player) => {
        this.currentPlayer = player;
        this.pictureUrl = `http://localhost:8089${player.picture}`;

        const formattedDate = player.birthday ? player.birthday.split('T')[0] : '';

        this.playerForm.patchValue({
          firstName: player.firstName,
          lastName: player.lastName,
          birthday: formattedDate,
          nationality: player.nationality,
          number: player.number,
          position: player.position
        });
      },
      error: (error) => {
        console.error('Error loading player data:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load player data',
          icon: 'error',
          confirmButtonColor: '#c1121f'
        });
        this.router.navigate(['/players-list']);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          title: 'Invalid File Type',
          text: 'Only JPG, PNG, and GIF files are allowed.',
          icon: 'error',
          confirmButtonColor: '#c1121f'
        });
        return;
      }

      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        Swal.fire({
          title: 'File Too Large',
          text: 'The file size must be less than 2MB.',
          icon: 'error',
          confirmButtonColor: '#c1121f'
        });
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.pictureUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.playerForm.invalid) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill out all required fields',
        icon: 'error',
        confirmButtonColor: '#c1121f'
      });
      return;
    }

    this.isSubmitting = true;

    const player: Player = {
      ...this.playerForm.value,
      id: this.playerId,
      birthday: new Date(this.playerForm.value.birthday).toISOString().split('T')[0],
    };

    this.playerService.updatePlayer(this.playerId, player, this.selectedFile).subscribe({
      next: (response) => {
        console.log('Player updated successfully:', response);

        Swal.fire({
          title: 'Success!',
          text: 'Player updated successfully',
          icon: 'success',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });

        setTimeout(() => {
          this.router.navigate(['/players-list']);
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating player:', error);
        Swal.fire({
          title: 'Error',
          text: error.message || 'Failed to update player',
          icon: 'error',
          confirmButtonColor: '#c1121f'
        });
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/players-list']);
  }
}
