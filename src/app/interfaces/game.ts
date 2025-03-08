import {Ticket} from "./ticket";

export interface Game {
  id?: number;
  date: string;
  time: string;
  opponent: string;
  competition: Competition;
  tickets?: Ticket[];
}

export enum Competition {
  BOTOLA_PRO = 'BOTOLA_PRO',
  THRONE_CUP = 'THRONE_CUP',
  CAF_SUPER_CUP = 'CAF SUPER_CUP',
  CLUB_WORLD_CUP = 'CLUB WORLD_CUP'
}
