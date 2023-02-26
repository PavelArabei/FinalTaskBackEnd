import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
//import { doc } from 'prettier';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message, MessageDocument } from './schemas/message.scheme';
import { User } from './entities/user.entity';
import { words } from '../game/const';
import { GameService } from 'src/game/game.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private gameService: GameService,
  ) {}
  messages: Message[] = [];

  async create(createMessageDto: CreateMessageDto, clientId: string) {
    const message = {
      name: this.gameService.getRoomUser(clientId)?.name,
      text: createMessageDto.text,
      id: clientId,
    };
    this.messages.push(message);

    return message;
  }

  findAll() {
    //return `This action returns all messages`;
    return this.messages;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  removeMessage(clientId: string, text: string) {
    const clientName = this.gameService.getRoomUser(clientId)?.name;

    const Index = this.messages.findIndex(
      (message) =>
        message.name === clientName &&
        message.text === text &&
        message.id === clientId,
    );
    if (Index === -1) return -1;

    this.messages.splice(Index, 1);
    return this.messages;
  }

  clearMesseges() {
    this.messages = [];
    return this.messages;
  }
}
