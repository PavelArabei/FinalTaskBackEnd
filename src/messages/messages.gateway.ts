import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Server, Socket } from 'socket.io';
import { ConnectedSocket } from '@nestjs/websockets/decorators';
import { GameService } from 'src/game/game.service';


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
  constructor(
    private readonly messagesService: MessagesService,
    private gameService: GameService,
  ) {}

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

  @SubscribeMessage('typing')
  async typing(
    @MessageBody('isTyping') isTyping: boolean,
    @ConnectedSocket() client: Socket,
  ) {
    const name = await this.gameService.getClientByName(client.id);

    client.broadcast.emit('typing', { name, isTyping });
  }
}
