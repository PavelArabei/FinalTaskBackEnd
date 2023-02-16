import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConnectedSocket } from '@nestjs/websockets/decorators';
import { config } from '../config';
import { GameService } from './game.service';
import { User } from 'src/messages/entities/user.entity';

const { DEFAULT_PLAYERS, DEFAULT_TIMER } = config;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;
  timeOut: NodeJS.Timeout;
  config: any;
  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('join')
  async joinRoom(@MessageBody() user: User, @ConnectedSocket() client: Socket) {
    user.id = client.id;
    const Name = this.gameService.identify(user, client.id);
    this.server.emit('join', Name);

    if (this.readyToStart()) {
      //calculate round and user turn
      const { users, round } = this.gameService.getCurrentLeadAndRaund();

      this.server.emit('roundStarted', {
        round: round,
        currentLead: users[round],
        allPlayers: users,
        // userCount: this.messagesService.getClientsCount(),
      });
      this.startTimer();
    }
  }

  @SubscribeMessage('roundStarted')
  async startRound() {
    console.log(77888);

    this.gameService.changeRound();
    //if (this.readyToStart()) {
    //calculate round and user turn
    const { users, round } = this.gameService.getCurrentLeadAndRaund();

    this.server.emit('roundStarted', {
      round: round,
      currentLead: users[round],
      allPlayers: users,
      // userCount: this.messagesService.getClientsCount(),
    });
    this.startTimer();
    //}
    //
  }

  isRoundStarted = () => this.timeOut;

  readyToStart = () =>
    this.gameService.getClientsCount() >= 2 && !this.isRoundStarted();

  startTimer() {
    const isRoundStarted =
      !this.timeOut && this.gameService.getClientsCount() >= 2;
    //if (!isRoundStarted) {
    this.timeOut = setTimeout(() => {
      this.nextRound();
      clearTimeout(this.timeOut);
    }, DEFAULT_TIMER);
    //}
  }

  nextRound() {
    this.server.emit('roundFinished', {
      users: this.gameService.calculateScore(),
    });
  }

  @SubscribeMessage('usersLeaved')
  async userLeave(@ConnectedSocket() client: Socket) {
    this.gameService.deleteUser(client.id);
    client.disconnect();
    this.server.emit('usersLeaved', {
      users: Object.values(this.gameService.clientIdObj),
    });
  }
}
