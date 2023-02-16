import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { User } from './entities/user.entity';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Server, Socket } from 'socket.io';
import { ConnectedSocket } from '@nestjs/websockets/decorators';
import { config } from '../config';

const { DEFAULT_PLAYERS, DEFAULT_TIMER } = config;

class CanvasStep {
  coords: {
    x: number;
    y: number;
  }[];
  lineWidth?: number;
  strokeStyle?: string | CanvasGradient | CanvasPattern;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway {
  @WebSocketServer()
  server: Server;
  timeOut: NodeJS.Timeout;
  config: any;
  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('canvasShare')
  async getCanvasData(
    @MessageBody() cavasData: CanvasStep[],
    @ConnectedSocket() client: Socket,
  ) {
    console.log(1111);
    console.log(client.id);
    this.server.emit('message', cavasData);
  }

  @SubscribeMessage('createMessage')
  async create(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.create(
      createMessageDto,
      client.id,
    );

    this.server.emit('message', message);

    return message;
  }

  @SubscribeMessage('findAllMessages')
  async findAll() {
    return this.messagesService.findAll();
  }

  @SubscribeMessage('updateMessage')
  update(@MessageBody() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.update(updateMessageDto.id, updateMessageDto);
  }

  @SubscribeMessage('removeMessage')
  async remove(@MessageBody() text: string, @ConnectedSocket() client: Socket) {
    const messages = this.messagesService.removeMessage(client.id, text);
    this.server.emit('removeMessage', messages);

    return messages;
  }

  @SubscribeMessage('join')
  async joinRoom(@MessageBody() user: User, @ConnectedSocket() client: Socket) {
    user.id = client.id;
    const Name = this.messagesService.identify(user, client.id);
    this.server.emit('join', Name);
    //this.server.emit('roundStarted', {
    //  round: 1,
    //  currentLead: 'user1',
    //  userCount: this.messagesService.getClientsCount(),
    //});

    if (this.readyToStart()) {
      //calculate round and user turn
      const { users, round } = this.messagesService.getCurrentLeadAndRaund();

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
  async startRaund() {
    console.log(77888);

    this.messagesService.changeRound();
    //if (this.readyToStart()) {
    //calculate round and user turn
    const { users, round } = this.messagesService.getCurrentLeadAndRaund();

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

  @SubscribeMessage('typing')
  async typing(
    @MessageBody('isTyping') isTyping: boolean,
    @ConnectedSocket() client: Socket,
  ) {
    const name = await this.messagesService.getClientByName(client.id);

    client.broadcast.emit('typing', { name, isTyping });
  }

  isRoundStarted = () => this.timeOut;

  readyToStart = () =>
    this.messagesService.getClientsCount() >= 2 && !this.isRoundStarted();

  startTimer() {
    const isRoundStarted =
      !this.timeOut && this.messagesService.getClientsCount() >= 2;
    //if (!isRoundStarted) {
    this.timeOut = setTimeout(() => {
      this.nextRound();
      clearTimeout(this.timeOut);
    }, DEFAULT_TIMER);
    //}
  }

  nextRound() {
    //todo
    //если есть не все users съиграли, то скё
    // this.server.emit('nextTurn', {
    //   leadUser:userId,
    // });
    // иначе показать roundFinished  и score всех игроков

    this.server.emit('roundFinished', {
      users: this.messagesService.calculateScore(),
    });
  }

  @SubscribeMessage('usersLeaved')
  async userLeave(@ConnectedSocket() client: Socket) {
    this.messagesService.deleteUser(client.id);
    client.disconnect();
    this.server.emit('usersLeaved', {
      users: Object.values(this.messagesService.clientIdObj),
    });
  }
}
