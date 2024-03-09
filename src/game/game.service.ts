import { Injectable } from '@nestjs/common';
import { NewGameDto, Player } from './interface';
import { calculatePlayerResult, generateRandomValue, transformValue } from 'src/common/helper';
import { Observable, exhaustMap, interval, map, merge, of, take } from 'rxjs';

// @Injectable()
// export class GameService {
//   newGame(newGameDto: NewGameDto) {
//     const guessedValue = parseFloat((Math.random() * (10 - 1) + 1).toFixed(2));
//     const result = newGameDto.players.map(player => {
//       if (guessedValue - player.multiplier > 0) {
//         player.points *= player.multiplier
//         player.totalPoints += player.points
//       } else if (guessedValue === player.multiplier) {
//         player.points *= guessedValue
//       } else {
//         player.points = 0
//       }
//       return player
//     })
//     return { result, guessedValue }
//   }

// }
@Injectable()
export class GameService {
  newGame(newGameDto: NewGameDto): { results: Player[], guessedValue: number } {
    const guessedValue = generateRandomValue(1, 10);
    const results = newGameDto.players.map(player => calculatePlayerResult(player, guessedValue));
    return { results, guessedValue };
  }

  trackProgress(gameResult: any, speed: number): Observable<any> {
    let cumulativeScore = 0;
    let elapsedTime = 0;
    const gameProgress: any[] = [];
    const sourceInterval = interval(1000 / transformValue(speed));
    const delayedInterval = sourceInterval.pipe(take(gameResult.guessedValue * 100));

    return merge(delayedInterval, of(true)).pipe(
      exhaustMap(() => {
        cumulativeScore += 0.001 + (cumulativeScore) * 0.003;
        elapsedTime += 0.01;
        return of({ X_coord: elapsedTime, Y_coord: cumulativeScore.toFixed(2) });
      }),
      map(val => {
        gameProgress.push(val);
        return gameProgress;
      })
    );
  }
}

