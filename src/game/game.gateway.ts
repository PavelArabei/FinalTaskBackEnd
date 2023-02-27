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
import { Canvas } from './dto/canvas.dto';

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
  constructor(private readonly gameService: GameService) { }

  @SubscribeMessage('join')
  async joinRoom(@MessageBody() user: User, @ConnectedSocket() client: Socket) {
    if (this.server.engine.clientsCount === 1) {
      this.gameService.clearAll();
    }
    
    user.id = client.id;
    this.gameService.joinRoom(user);
    this.server.to(user?.id).emit('userId', user.id);

    this.server.emit('join', this.gameService.getRoomUsers());

    if (this.gameService.readyToStart()) {
      const lead = this.gameService.getLead();
      const playersCount = this.gameService.getClientsCount();
      this.server.to(lead.id).emit('startTheGame', playersCount);
    }
  }

  @SubscribeMessage('startTheGame')
  async startTheGame() {
    const lead = this.gameService.getLead();
    this.chooseWordForRound(lead);
  }

  async chooseWordForRound(lead) {
    const Words = this.gameService.getThreeRandomWord();
    this.server.to(lead?.id).emit('chooseWordForRound', Words);
  }

  @SubscribeMessage('wordIsChosen')
  async WordIsChosen(
    @MessageBody() word: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.gameService.setCurrentWord(word);
    this.startRound();
  }

  @SubscribeMessage('roundStarted')
  async startRound() {
    const { users, round } = this.gameService.getCurrentLeadAndRaund();
    const CurrentWord = this.gameService.getCurrentWord();
    const lead = this.gameService.getLead();
    const allRounds = this.gameService.getAllRound();
    this.server.emit('roundStarted', {
      word: CurrentWord,
      round: round,
      lead: lead,
      allPlayers: users,
      allRounds: allRounds,
    });
    this.startTimer();
  }

  startTimer() {
    this.timeOut = setTimeout(() => {
      this.nextRound();
      clearTimeout(this.timeOut);
    }, DEFAULT_TIMER);
  }

  nextRound() {
    this.gameService.changeRound();
    const lead = this.gameService.getLead();
    this.server.emit('roundFinished', {
      users: this.gameService.getRoomUsers(),
      lead: lead,
    });
  }

  @SubscribeMessage('usersLeaved')
  async userLeave(@ConnectedSocket() client: Socket) {
    this.gameService.deleteUser(client.id);
    client.disconnect();
    this.server.emit('usersLeaved', {
      users: this.gameService.getRoomUsers(),
    });
  }

  @SubscribeMessage('canvasShare')
  async getCanvasData(
    @MessageBody() cavasData: Canvas[],
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast.emit('canvasShare', cavasData);
  }

  @SubscribeMessage('wordForWin')
  async checkTheWord(
    @MessageBody() word: string,
    @ConnectedSocket() client: Socket,
  ) {
    const isWordTrue = this.gameService.isWordTrue(word);
    client.emit('wordForWin', isWordTrue);
    if (isWordTrue) {
      this.gameService.addWinner();
      this.gameService.addPoinsToUser(client.id);
      const ReadyToNextRound = this.gameService.isAllPlayersAnsweredRight();
      if (this.gameService.isFinalRound()) {
        const sortUsers = this.gameService
          .getRoomUsers()
          .sort((a, b) => a.currentScore - b.currentScore);
        clearTimeout(this.timeOut);
        console.log(sortUsers);

        this.server.emit('gameFinished', {
          users: sortUsers,
        });
        return;
      }
      if (ReadyToNextRound) {
        clearTimeout(this.timeOut);
        this.nextRound();
      }
    }
  }
  @SubscribeMessage('gameFinished')
  async finishGame() {
    this.server.emit('endGame');
    this.gameService.clearAll();
  }

  @SubscribeMessage('playerReadyToStartNextRound')
  async playerReadyToStartNextRound() {
    this.server.emit('playerReadyToStartNextRound');
    const lead = this.gameService.getLead();
    this.chooseWordForRound(lead);
  }

  @SubscribeMessage('disconnect')
  async disconnect(@ConnectedSocket() client: Socket) {
    this.userLeave(client);
    if (this.server.engine.clientsCount === 0) {
      console.log(this.server.listenerCount('roundStarted'));
      this.gameService.clearAll();
    }
  }
}
