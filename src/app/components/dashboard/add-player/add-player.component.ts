import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlayerService } from "../../../services/player.service";
import { Player } from "../../../interfaces/player";
import { MatIconModule } from "@angular/material/icon";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-player',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIconModule],
  templateUrl: './add-player.component.html',
  styleUrls: ['./add-player.component.css'],
})
export class AddPlayerComponent implements OnInit {
  playerForm: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private playerService: PlayerService,
    private router: Router
  ) {
    this.playerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthday: ['', Validators.required],
      nationality: ['', Validators.required],
      number: ['', [Validators.required, Validators.min(1), Validators.max(99)]],
      position: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.playerForm.invalid || !this.selectedFile) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill out all fields and upload a picture.',
        icon: 'error',
        confirmButtonColor: '#c1121f'
      });
      return;
    }

    this.isSubmitting = true;

    const player: Player = {
      ...this.playerForm.value,
      birthday: new Date(this.playerForm.value.birthday).toISOString().split('T')[0],
    };

    this.playerService.createPlayer(player, this.selectedFile).subscribe({
      next: (response) => {
        console.log('Player created successfully:', response);

        Swal.fire({
          title: 'Success!',
          text: 'Player added successfully',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });

        setTimeout(() => {
          this.router.navigate(['/players-list']);
        }, 3000);
      },
      error: (error) => {
        console.error('Error creating player:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to create player',
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
