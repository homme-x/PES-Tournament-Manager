import { Match } from "@/types/tournament";
import { Card, CardContent } from "./ui/card";
import { useEffect, useState } from "react";

interface MatchHistoryProps {
  matches: Match[];
}

export function MatchHistory({ matches }: MatchHistoryProps) {
  const [displayedMatches, setDisplayedMatches] = useState<Match[]>([]);

  // Mettre à jour l'historique quand de nouveaux matchs sont joués
  useEffect(() => {
    const playedMatches = matches
      .filter(match => match.played)
      .sort((a, b) => (b.id > a.id ? 1 : -1));
    setDisplayedMatches(playedMatches);
  }, [matches]);

  // Extraire le numéro de la poule à partir de l'ID du joueur (format: "P1-1" où 1 est le numéro de la poule)
  const getPoolNumber = (playerId: string) => {
    const poolNumber = playerId.split('-')[0].replace('P', '');
    return parseInt(poolNumber);
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold mb-6 gradient-text">Match History</h2>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {displayedMatches.map((match) => (
            <div
              key={match.id}
              className="p-4 rounded-lg bg-muted/50 border border-border hover:bg-muted/70 transition-colors"
            >
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Pool {getPoolNumber(match.homePlayer.id)}</span>
                  <span className="text-sm text-muted-foreground">Match ID: {match.id}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <div className="text-right">
                    <span className="text-primary font-medium">{match.homePlayer.name}</span>
                    <div className="text-sm text-muted-foreground">{match.homePlayer.team}</div>
                  </div>
                  <div className="text-center font-mono text-lg">
                    <span className="font-bold">{match.homeScore}</span>
                    <span className="text-muted-foreground mx-2">-</span>
                    <span className="font-bold">{match.awayScore}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-primary font-medium">{match.awayPlayer.name}</span>
                    <div className="text-sm text-muted-foreground">{match.awayPlayer.team}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {displayedMatches.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No matches played yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
