import { KnockoutMatch, Player } from "@/types/tournament";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { useState } from "react";

interface KnockoutStageProps {
  matches: KnockoutMatch[];
  onScoreSubmit: (match: KnockoutMatch, homeScore: number, awayScore: number) => void;
}

export function KnockoutStage({ matches, onScoreSubmit }: KnockoutStageProps) {
  const rounds = ['R16', 'QF', 'SF', 'F'];
  const [roundMatches, setRoundMatches] = useState<{ [key: string]: KnockoutMatch[] }>(() => {
    const grouped: { [key: string]: KnockoutMatch[] } = {};
    matches.forEach(match => {
      if (!grouped[match.round]) {
        grouped[match.round] = [];
      }
      grouped[match.round].push(match);
    });
    return grouped;
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-8">
        {rounds.map((round) => (
          <div key={round} className="space-y-4">
            <h3 className="text-xl font-bold text-center gradient-text">{round}</h3>
            <div className="space-y-4">
              {roundMatches[round]?.filter(m => m.leg === 'first').map((match) => (
                <div key={match.id} className="space-y-2">
                  <Card className="p-4">
                    {match.homePlayer && match.awayPlayer ? (
                      <>
                        <div className="space-y-2">
                          {/* Match Aller */}
                          <div className="text-sm font-medium text-muted-foreground mb-2">Match Aller</div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{match.homePlayer.name}</span>
                            <Input
                              type="number"
                              className="w-16 text-center"
                              value={match.homeScore ?? ""}
                              onChange={(e) => onScoreSubmit(match, Number(e.target.value), match.awayScore ?? 0)}
                              disabled={match.played}
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{match.awayPlayer.name}</span>
                            <Input
                              type="number"
                              className="w-16 text-center"
                              value={match.awayScore ?? ""}
                              onChange={(e) => onScoreSubmit(match, match.homeScore ?? 0, Number(e.target.value))}
                              disabled={match.played}
                            />
                          </div>
                        </div>
                        
                        {/* Match Retour */}
                        {roundMatches[round]?.find(m => 
                          m.leg === 'second' && 
                          m.homePlayer?.id === match.awayPlayer.id && 
                          m.awayPlayer?.id === match.homePlayer.id
                        ) && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="text-sm font-medium text-muted-foreground mb-2">Match Retour</div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{match.awayPlayer.name}</span>
                              <Input
                                type="number"
                                className="w-16 text-center"
                                value={match.homeScore ?? ""}
                                onChange={(e) => {
                                  const returnMatch = roundMatches[round]?.find(m => 
                                    m.leg === 'second' && 
                                    m.homePlayer?.id === match.awayPlayer.id
                                  );
                                  if (returnMatch) {
                                    onScoreSubmit(returnMatch, Number(e.target.value), match.awayScore ?? 0);
                                  }
                                }}
                                disabled={match.played}
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{match.homePlayer.name}</span>
                              <Input
                                type="number"
                                className="w-16 text-center"
                                value={match.awayScore ?? ""}
                                onChange={(e) => {
                                  const returnMatch = roundMatches[round]?.find(m => 
                                    m.leg === 'second' && 
                                    m.homePlayer?.id === match.awayPlayer.id
                                  );
                                  if (returnMatch) {
                                    onScoreSubmit(returnMatch, returnMatch.homeScore ?? 0, Number(e.target.value));
                                  }
                                }}
                                disabled={match.played}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        En attente des qualifiés
                      </div>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
