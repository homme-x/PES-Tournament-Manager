import { Player, Pool, Match, KnockoutMatch } from "@/types/tournament";

export function generatePoolMatches(players: Player[]): Match[] {
  const matches: Match[] = [];
  
  // Générer tous les matchs possibles dans la poule
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        id: `M${players[i].id}-${players[j].id}`,
        poolId: parseInt(players[i].id.split('-')[0].substring(1)),
        homePlayer: players[i],
        awayPlayer: players[j],
        played: false
      });
    }
  }
  
  return matches;
}

export function updatePoolStandings(pool: Pool): Player[] {
  const updatedPlayers = [...pool.players];
  
  // Réinitialiser les statistiques
  updatedPlayers.forEach(player => {
    player.points = 0;
    player.played = 0;
    player.won = 0;
    player.drawn = 0;
    player.lost = 0;
    player.goalsFor = 0;
    player.goalsAgainst = 0;
    player.goalDifference = 0;
  });

  // Calculer les statistiques basées sur les matchs
  pool.matches.forEach(match => {
    if (match.played && match.homeScore !== undefined && match.awayScore !== undefined) {
      const homePlayer = updatedPlayers.find(p => p.id === match.homePlayer.id);
      const awayPlayer = updatedPlayers.find(p => p.id === match.awayPlayer.id);
      
      if (homePlayer && awayPlayer) {
        // Mise à jour des buts
        homePlayer.goalsFor += match.homeScore;
        homePlayer.goalsAgainst += match.awayScore;
        awayPlayer.goalsFor += match.awayScore;
        awayPlayer.goalsAgainst += match.homeScore;
        
        // Mise à jour des matchs joués
        homePlayer.played += 1;
        awayPlayer.played += 1;
        
        // Mise à jour des résultats
        if (match.homeScore > match.awayScore) {
          homePlayer.points += 3;
          homePlayer.won += 1;
          awayPlayer.lost += 1;
        } else if (match.homeScore < match.awayScore) {
          awayPlayer.points += 3;
          awayPlayer.won += 1;
          homePlayer.lost += 1;
        } else {
          homePlayer.points += 1;
          awayPlayer.points += 1;
          homePlayer.drawn += 1;
          awayPlayer.drawn += 1;
        }
        
        // Calculer la différence de buts
        homePlayer.goalDifference = homePlayer.goalsFor - homePlayer.goalsAgainst;
        awayPlayer.goalDifference = awayPlayer.goalsFor - awayPlayer.goalsAgainst;
      }
    }
  });

  // Trier les joueurs selon les critères de la Ligue des Champions
  return updatedPlayers.sort((a, b) => {
    // 1. Points
    if (b.points !== a.points) return b.points - a.points;
    // 2. Différence de buts
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    // 3. Buts marqués
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    // 4. Ordre alphabétique en cas d'égalité parfaite
    return a.name.localeCompare(b.name);
  });
}

export function generateKnockoutStage(qualifiedPlayers: Player[]): KnockoutMatch[] {
  const matches: KnockoutMatch[] = [];
  const numPlayers = qualifiedPlayers.length;
  const numRound1Matches = numPlayers / 2;
  
  // Générer les premiers matchs
  for (let i = 0; i < numRound1Matches; i++) {
    const homePlayer = qualifiedPlayers[i];
    const awayPlayer = qualifiedPlayers[numPlayers - 1 - i];
    
    // Match aller
    matches.push({
      id: `KO-R1-${i}-1`,
      round: 'R16',
      leg: 'first',
      homePlayer,
      awayPlayer,
      played: false,
      nextMatchId: `KO-QF-${Math.floor(i/2)}-1`
    });
    
    // Match retour
    matches.push({
      id: `KO-R1-${i}-2`,
      round: 'R16',
      leg: 'second',
      homePlayer: awayPlayer,
      awayPlayer: homePlayer,
      played: false,
      nextMatchId: `KO-QF-${Math.floor(i/2)}-1`
    });
  }
  
  return matches;
}

export function isPoolCompleted(pool: Pool): boolean {
  return pool.matches.every(match => match.played);
}
