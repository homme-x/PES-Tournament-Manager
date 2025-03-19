export interface Player {
  id: string; // Format: "P{poolNumber}-{playerNumber}" ex: "P1-1"
  name: string;
  team: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface Match {
  id: string;
  poolId: number;
  homePlayer: Player;
  awayPlayer: Player;
  homeScore?: number;
  awayScore?: number;
  played: boolean;
  round?: string; // Pour la phase à élimination directe
  leg?: 'first' | 'second'; // Pour les matches aller-retour
}

export interface Pool {
  id: number;
  players: Player[];
  matches: Match[];
  completed: boolean;
}

export interface KnockoutMatch {
  id: string;
  round: string;
  leg: 'first' | 'second';
  homePlayer?: Player;
  awayPlayer?: Player;
  homeScore?: number;
  awayScore?: number;
  nextMatchId?: string;
  played: boolean;
}

export interface TournamentSettings {
  numPools: number;
  playersPerPool: number;
  qualifiersPerPool: number;
  currentPhase: 'group' | 'knockout';
}
