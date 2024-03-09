import { Player } from "src/game/interface";

export const transformValue = (input: number) => {
    switch (input) {
        case 1: return 1;
        case 2: return 10;
        case 3: return 100;
        case 4: return 1000;
        default: return input;
    }
};

export const generateRandomValue = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(2))

export const calculatePlayerResult = (player: Player, guessedValue: number) => {
    let points = player.points;
    if (guessedValue - player.multiplier > 0) {
        points *= player.multiplier;
    } else if (guessedValue === player.multiplier) {
        points *= guessedValue;
    } else {
        points = 0;
    }

    const totalPoints = points + player.totalPoints;

    return { ...player, points, totalPoints };
}