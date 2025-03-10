import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import {Game} from "../../../interfaces/game";
import {Category, Ticket} from "../../../interfaces/ticket";
import {TicketService} from "../../../services/ticket.service";
import {GameService} from "../../../services/game.service";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import Swal from "sweetalert2";


@Component({
  selector: 'app-add-tickets',
  templateUrl: 'add-tickets.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    DatePipe,
    NgForOf
  ],
  styleUrls: ['add-tickets.component.css']
})
export class AddTicketsComponent implements OnInit {
  ticketForm: FormGroup;
  games: Game[] = [];
  categories = Object.values(Category);
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private ticketService: TicketService,
    private gameService: GameService,
    private router: Router
  ) {
    this.ticketForm = this.formBuilder.group({
      price: ['', [Validators.required, Validators.min(0)]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      category: ['', Validators.required],
      gameId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.gameService.getAllGames().subscribe({
      next: (data) => {
        this.games = data;
      },
      error: (error) => {
        console.error('Error loading games:', error);
        this.error = 'Failed to load games. Please try again later.';
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.ticketForm.invalid) {
      return;
    }

    this.loading = true;

    const ticket = {
      price: this.ticketForm.value.price,
      quantity: this.ticketForm.value.quantity,
      category: this.ticketForm.value.category,
      game: { id: this.ticketForm.value.gameId },
    };


    this.ticketService.createTicket(ticket).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Success!',
          text: 'Ticket created successfully',
          icon: 'success',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        this.router.navigate(['/tickets-list']);
      },
      error: (error) => {
        console.error('Error creating ticket:', error);
        this.error = error.message || 'Failed to create ticket';
        this.loading = false;
      },
    });
  }

  get f() { return this.ticketForm.controls; }

  cancel(): void {
    this.router.navigate(['/tickets-list']);
  }
}
