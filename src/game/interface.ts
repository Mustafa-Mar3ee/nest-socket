export interface Player {
    name: string;
    points: number;
    multiplier: number
    totalPoints: number
}
export class NewGameDto {
    speed: number
    players: Player[]
}
