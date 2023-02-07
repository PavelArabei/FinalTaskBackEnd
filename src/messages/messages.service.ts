import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  messages: Message[] = [{ name: 'Pavel', text: 'hey' }];
  clientIdObj = {};

  identify(name: string, clientId: string) {
    this.clientIdObj[clientId] = name;

    return Object.values(this.clientIdObj);
  }

  getClientByName(clientId: string) {
    return this.clientIdObj[clientId];
  }

  create(createMessageDto: CreateMessageDto, clientId: string) {
    const message = {
      name: this.clientIdObj[clientId],
      text: createMessageDto.text,
    };
    this.messages.push(createMessageDto);
    return message;
  }

  findAll() {
    //return `This action returns all messages`;
    return this.messages;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
