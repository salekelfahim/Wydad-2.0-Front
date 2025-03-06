import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {PlayerService} from "../../../services/player.service";
import {Player} from "../../../interfaces/player";
import {MatIconModule} from "@angular/material/icon";

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
    }
  }

  onSubmit(): void {
    if (this.playerForm.invalid || !this.selectedFile) {
      alert('Please fill out all fields and upload a picture.');
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
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error creating player:', error);
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
