// src/app/components/add-game/add-game.component.ts
import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {GameService} from "../../../services/game.service";
import {Competition, Game} from "../../../interfaces/game";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-add-game',
  templateUrl: './add-game.component.html',
  styleUrls: ['./add-game.component.css'],
  imports: [
    ReactiveFormsModule,
    NgForOf
  ],
  standalone: true
})
export class AddGameComponent implements OnInit {
  gameForm: FormGroup;
  isSubmitting = false;

  competitions = Object.values(Competition);

  constructor(
    private fb: FormBuilder,
    private gameService: GameService,
    private router: Router
  ) {
    this.gameForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      opponent: ['', Validators.required],
      competition: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.gameForm.invalid) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill out all required fields',
        icon: 'error',
        confirmButtonColor: '#c1121f',
      });
      return;
    }

    this.isSubmitting = true;

    const game: Game = {
      ...this.gameForm.value,
    };

    this.gameService.createGame(game).subscribe({
      next: (response) => {
        console.log('Game created successfully:', response);

        Swal.fire({
          title: 'Success!',
          text: 'Game added successfully',
          icon: 'success',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        setTimeout(() => {
          this.router.navigate(['/players-list']);
        }, 3000);
      },
      error: (error) => {
        console.error('Error creating game:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to create game',
          icon: 'error',
          confirmButtonColor: '#c1121f',
        });
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/players-list']);
  }
}
