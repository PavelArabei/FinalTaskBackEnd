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
  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('join')
  async joinRoom(@MessageBody() user: User, @ConnectedSocket() client: Socket) {
    user.id = client.id;
    this.gameService.joinRoom(user);
    this.server.to(user?.id).emit('userId', user.id);

    this.server.emit('join', this.gameService.getRoomUsers());

    if (this.gameService.readyToStart()) {
      const lead = this.gameService.getLead();
      console.log(lead);
      const playersCount = this.gameService.getClientsCount();
      this.server.to(lead.id).emit('startTheGame', playersCount);
      //!this.startTimer();
    }
  }

  @SubscribeMessage('startTheGame')
  async startTheGame() {
    const { users, round } = this.gameService.getCurrentLeadAndRaund();
    this.chooseWordForRound(users[round]);
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
    //this.gameService.changeRound();
    //if (this.readyToStart()) {
    //calculate round and user turn
    const { users, round } = this.gameService.getCurrentLeadAndRaund();
    const CurrentWord = this.gameService.getCurrentWord();

    this.server.emit('roundStarted', {
      word: CurrentWord,
      round: round,
      lead: users[round],
      allPlayers: users,
      // userCount: this.messagesService.getClientsCount(),
    });
    this.startTimer();
    //}
    //
  }

  startTimer() {
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
    //!next round
    this.gameService.changeRound();
    const { users, round } = this.gameService.getCurrentLeadAndRaund();
    console.log(round);

    this.chooseWordForRound(users[round]);
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
      if (ReadyToNextRound) {
        clearTimeout(this.timeOut);
        this.nextRound();
      }
    }
  }
}
