import { Pool, Player } from "@/types/tournament";
import { Card, CardContent } from "./ui/card";
import { Select } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

interface MatchScoreFormProps {
  pools: Pool[];
  onScoreSubmit: (poolId: number, player1Id: string, player2Id: string, score1: number, score2: number) => void;
}

export function MatchScoreForm({ pools, onScoreSubmit }: MatchScoreFormProps) {
  const [selectedPool, setSelectedPool] = useState<number>(0);
  const [selectedPlayer1, setSelectedPlayer1] = useState<string>("");
  const [selectedPlayer2, setSelectedPlayer2] = useState<string>("");
  const [score1, setScore1] = useState<string>("");
  const [score2, setScore2] = useState<string>("");

  // Reset players when pool changes
  useEffect(() => {
    setSelectedPlayer1("");
    setSelectedPlayer2("");
    setScore1("");
    setScore2("");
  }, [selectedPool]);

  // Reset player 2 when player 1 changes
  useEffect(() => {
    setSelectedPlayer2("");
    setScore1("");
    setScore2("");
  }, [selectedPlayer1]);

  const handleSubmit = () => {
    if (selectedPlayer1 && selectedPlayer2 && score1 && score2) {
      onScoreSubmit(
        selectedPool,
        selectedPlayer1,
        selectedPlayer2,
        parseInt(score1),
        parseInt(score2)
      );
      // Reset scores after submission
      setScore1("");
      setScore2("");
      // Reset player selections
      setSelectedPlayer1("");
      setSelectedPlayer2("");
    }
  };

  const currentPool = pools[selectedPool];
  const availablePlayers = currentPool?.players || [];
  
  // Filtrer les joueurs disponibles pour le deuxième joueur
  const player2Options = availablePlayers.filter(p => p.id !== selectedPlayer1);

  // Vérifier si un match entre ces joueurs a déjà été joué
  const isMatchPlayed = (player1Id: string, player2Id: string) => {
    if (!currentPool) return false;
    return currentPool.matches.some(
      match => match.played && 
      ((match.homePlayer.id === player1Id && match.awayPlayer.id === player2Id) ||
       (match.homePlayer.id === player2Id && match.awayPlayer.id === player1Id))
    );
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold mb-6 gradient-text">Enter Match Result</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select Pool</label>
            <Select
              value={selectedPool}
              onChange={(e) => setSelectedPool(Number(e.target.value))}
              className="w-full"
            >
              {pools.map((pool, index) => (
                <option key={index} value={index}>Pool {index + 1}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select First Player</label>
            <Select
              value={selectedPlayer1}
              onChange={(e) => setSelectedPlayer1(e.target.value)}
              className="w-full"
            >
              <option value="">Select a player</option>
              {availablePlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name} ({player.team})
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select Second Player</label>
            <Select
              value={selectedPlayer2}
              onChange={(e) => setSelectedPlayer2(e.target.value)}
              className="w-full"
              disabled={!selectedPlayer1}
            >
              <option value="">Select a player</option>
              {player2Options.map((player) => {
                const matchPlayed = isMatchPlayed(selectedPlayer1, player.id);
                return (
                  <option key={player.id} value={player.id} disabled={matchPlayed}>
                    {player.name} ({player.team}) {matchPlayed ? '(Match already played)' : ''}
                  </option>
                );
              })}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {selectedPlayer1 ? availablePlayers.find(p => p.id === selectedPlayer1)?.name : "Player 1"} Score
              </label>
              <Input
                type="number"
                value={score1}
                onChange={(e) => setScore1(e.target.value)}
                min={0}
                className="w-full"
                disabled={!selectedPlayer2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {selectedPlayer2 ? availablePlayers.find(p => p.id === selectedPlayer2)?.name : "Player 2"} Score
              </label>
              <Input
                type="number"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
                min={0}
                className="w-full"
                disabled={!selectedPlayer2}
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={!selectedPlayer1 || !selectedPlayer2 || !score1 || !score2}
          >
            Submit Score
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
