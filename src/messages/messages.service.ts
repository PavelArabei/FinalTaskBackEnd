import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
//import { doc } from 'prettier';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message, MessageDocument } from './schemas/message.scheme';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}
  messages: Message[] = [{ name: 'Pavel', text: 'hey' }];
  clientIdObj = {};

  identify(name: string, clientId: string) {
    this.clientIdObj[clientId] = name;

    return Object.values(this.clientIdObj);
  }

  getClientByName(clientId: string) {
    return this.clientIdObj[clientId];
  }

  async create(createMessageDto: CreateMessageDto, clientId: string) {
    //const newMessage = await new this.messageModel(createMessageDto);
    //console.log(newMessage);

    //const aLLusers = await this.messageModel.find().exec();

    const message = {
      name: this.clientIdObj[clientId],
      text: createMessageDto.text,
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

  remove(clientId: string, text: string) {
    const clientName = this.getClientByName(clientId);

    const Index = this.messages.findIndex(
      (message) => message.name === clientName && message.text === text,
    );
    if (Index === -1) return -1;

    this.messages.splice(Index, 1);
    return this.messages;
  }
}
