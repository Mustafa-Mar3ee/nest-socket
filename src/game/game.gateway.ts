import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';

import { Server, Socket } from 'socket.io'
import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: ["http://localhost:3000"]
  }
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly gameService: GameService) { }
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    client.disconnect()
  }
  @SubscribeMessage('startGame')
  onGameStart(@MessageBody() body: any) {


    const game = this.gameService.newGame(body);
    const gameProgress = this.gameService.trackProgress(game, body.speed);

    gameProgress.subscribe({
      next: (progress) => {
        this.server.emit('gameProgress', { msg: 'loading', content: { loading: progress } });
      },
      complete: () => {
        this.server.emit('gameResult', { msg: 'result', content: { result: game.results } });
      }
    });

  }

  @SubscribeMessage('sendMessage')
  sendMessage(@MessageBody() body: any) {
    this.server.emit('onChat', {
      msg: 'loading',
      content: {
        messages: body,
      }
    })


  }
}