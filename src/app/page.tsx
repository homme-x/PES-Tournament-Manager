"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Player, Pool, Match, TournamentSettings, KnockoutMatch } from "@/types/tournament";
import { generatePoolMatches, updatePoolStandings, generateKnockoutStage, isPoolCompleted } from "@/utils/tournament";
import { MatchScoreForm } from "@/components/match-score-form";
import { MatchHistory } from "@/components/match-history";
import { KnockoutStage } from "@/components/knockout-stage";

export default function Home() {
  const [settings, setSettings] = useState<TournamentSettings>({
    numPools: 2,
    playersPerPool: 4,
    qualifiersPerPool: 2,
    currentPhase: 'group'
  });

  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPool, setSelectedPool] = useState<number>(0);
  const [playerName, setPlayerName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [knockoutMatches, setKnockoutMatches] = useState<KnockoutMatch[]>([]);

  // Initialiser les poules
  useEffect(() => {
    const newPools: Pool[] = Array.from({ length: settings.numPools }, (_, index) => ({
      id: index,
      players: [],
      matches: [],
      completed: false
    }));
    setPools(newPools);
  }, [settings.numPools]);

  const addPlayer = () => {
    if (playerName && teamName && pools[selectedPool].players.length < settings.playersPerPool) {
      const newPools = [...pools];
      const newPlayer: Player = {
        id: `P${selectedPool + 1}-${pools[selectedPool].players.length + 1}`,
        name: playerName,
        team: teamName,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      };

      newPools[selectedPool].players.push(newPlayer);
      
      // Générer les matchs si la poule est complète
      if (newPools[selectedPool].players.length === settings.playersPerPool) {
        newPools[selectedPool].matches = generatePoolMatches(newPools[selectedPool].players);
      }

      setPools(newPools);
      setPlayerName("");
      setTeamName("");
    }
  };

  const handleScoreSubmission = (poolIndex: number, player1Id: string, player2Id: string, score1: number, score2: number) => {
    const newPools = [...pools];
    const pool = newPools[poolIndex];
    
    // Trouver le match correspondant
    const match = pool.matches.find(m => 
      (m.homePlayer.id === player1Id && m.awayPlayer.id === player2Id) ||
      (m.homePlayer.id === player2Id && m.awayPlayer.id === player1Id)
    );

    if (match) {
      // Mettre à jour le score en respectant l'ordre des joueurs dans le match
      if (match.homePlayer.id === player1Id) {
        match.homeScore = score1;
        match.awayScore = score2;
      } else {
        match.homeScore = score2;
        match.awayScore = score1;
      }
      match.played = true;

      // Mettre à jour le classement
      pool.players = updatePoolStandings(pool);
      
      // Vérifier si la poule est terminée
      pool.completed = isPoolCompleted(pool);
      
      setPools(newPools);
    }
  };

  const handleKnockoutScoreSubmission = (match: KnockoutMatch, homeScore: number, awayScore: number) => {
    const newMatches = knockoutMatches.map(m => {
      if (m.id === match.id) {
        return { ...m, homeScore, awayScore, played: true };
      }
      return m;
    });
    setKnockoutMatches(newMatches);
  };

  const startKnockoutPhase = () => {
    if (pools.every(pool => pool.completed)) {
      // Récupérer les joueurs qualifiés de chaque poule
      const qualifiedPlayers = pools.flatMap(pool => 
        pool.players.slice(0, settings.qualifiersPerPool)
      );

      // Générer les matchs de la phase à élimination directe
      const newKnockoutMatches = generateKnockoutStage(qualifiedPlayers);
      setKnockoutMatches(newKnockoutMatches);
      setSettings(prev => ({ ...prev, currentPhase: 'knockout' }));
    }
  };

  // Obtenir tous les matchs joués de toutes les poules
  const allPlayedMatches = pools.flatMap(pool => pool.matches.filter(match => match.played));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-center gradient-text mb-12">
          PES 4 Tournament Manager
        </h1>
        
        {settings.currentPhase === 'group' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-6 gradient-text">Tournament Settings</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Number of Pools</label>
                      <Input 
                        type="number" 
                        value={settings.numPools} 
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          numPools: Number(e.target.value)
                        }))}
                        className="w-full"
                        min={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Players per Pool</label>
                      <Input 
                        type="number" 
                        value={settings.playersPerPool} 
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          playersPerPool: Number(e.target.value)
                        }))}
                        className="w-full"
                        min={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Qualifiers per Pool</label>
                      <Input 
                        type="number" 
                        value={settings.qualifiersPerPool} 
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          qualifiersPerPool: Number(e.target.value)
                        }))}
                        className="w-full"
                        min={1}
                        max={settings.playersPerPool}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-6 gradient-text">Add Player</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Select Pool</label>
                      <Select
                        value={selectedPool}
                        onChange={(e) => setSelectedPool(Number(e.target.value))}
                        className="w-full"
                      >
                        {Array.from({ length: settings.numPools }, (_, i) => (
                          <option key={i} value={i}>Pool {i + 1}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Player Name</label>
                      <Input 
                        value={playerName} 
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full"
                        placeholder="Enter player name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Team Name</label>
                      <Input 
                        value={teamName} 
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full"
                        placeholder="Enter team name"
                      />
                    </div>
                    <Button 
                      onClick={addPlayer}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
                      disabled={pools[selectedPool]?.players.length >= settings.playersPerPool}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        <span>Add Player</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                {pools.map((pool, index) => (
                  <Card key={index} className="shadow-lg">
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-semibold mb-6 text-center gradient-text">Pool {index + 1}</h2>
                      <div className="space-y-6">
                        <div className="overflow-x-auto rounded-lg border border-border">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted">
                                <TableHead className="font-semibold">ID</TableHead>
                                <TableHead className="font-semibold">Player</TableHead>
                                <TableHead className="font-semibold">Team</TableHead>
                                <TableHead className="font-semibold text-center">P</TableHead>
                                <TableHead className="font-semibold text-center">W</TableHead>
                                <TableHead className="font-semibold text-center">D</TableHead>
                                <TableHead className="font-semibold text-center">L</TableHead>
                                <TableHead className="font-semibold text-center">GF</TableHead>
                                <TableHead className="font-semibold text-center">GA</TableHead>
                                <TableHead className="font-semibold text-center">GD</TableHead>
                                <TableHead className="font-semibold text-center">Pts</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {pool.players.map((player) => (
                                <TableRow key={player.id} className="hover:bg-muted/50">
                                  <TableCell className="font-mono">{player.id}</TableCell>
                                  <TableCell className="font-medium">{player.name}</TableCell>
                                  <TableCell>{player.team}</TableCell>
                                  <TableCell className="text-center">{player.played}</TableCell>
                                  <TableCell className="text-center">{player.won}</TableCell>
                                  <TableCell className="text-center">{player.drawn}</TableCell>
                                  <TableCell className="text-center">{player.lost}</TableCell>
                                  <TableCell className="text-center">{player.goalsFor}</TableCell>
                                  <TableCell className="text-center">{player.goalsAgainst}</TableCell>
                                  <TableCell className="text-center">{player.goalDifference}</TableCell>
                                  <TableCell className="text-center font-semibold">{player.points}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-8">
                <MatchScoreForm 
                  pools={pools}
                  onScoreSubmit={handleScoreSubmission}
                />
                <MatchHistory matches={allPlayedMatches} />
              </div>
            </div>

            {pools.every(pool => pool.completed) && (
              <div className="flex justify-center">
                <Button
                  onClick={startKnockoutPhase}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
                >
                  Start Knockout Phase
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center gradient-text">Knockout Phase</h2>
            <KnockoutStage
              matches={knockoutMatches}
              onScoreSubmit={handleKnockoutScoreSubmission}
            />
          </div>
        )}
      </div>
    </div>
  );
}
