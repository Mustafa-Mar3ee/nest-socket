import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';

import { Server, Socket } from 'socket.io'
import { GameService } from './game.service';
import { Subscription } from 'rxjs';

@WebSocketGateway({
  cors: {
    origin: ["http://localhost:3000"]
  }
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly gameService: GameService) { }
  private subscriptions: Map<string, Subscription> = new Map();

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    client.disconnect()
  }
  private cleanupSubscription(clientId: string) {
    const subscription = this.subscriptions.get(clientId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(clientId);
    }
  }
  @SubscribeMessage('startGame')
  onGameStart(@MessageBody() body: any, @ConnectedSocket() client: Socket) {


    const game = this.gameService.newGame(body);
    const gameProgress = this.gameService.trackProgress(game, body.speed);

    const subscription = gameProgress.subscribe({
      next: (progress) => {
        this.server.emit('gameProgress', { msg: 'loading', content: { loading: progress } });
      },
      complete: () => {
        this.server.emit('gameResult', { msg: 'result', content: { result: game.results } });
        this.cleanupSubscription(client.id);
      }
    });
    this.subscriptions.set(client.id, subscription);
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