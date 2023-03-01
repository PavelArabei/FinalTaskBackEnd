import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { Message, MessageSchema } from './schemas/message.scheme';
import { GameModule } from 'src/game';

@Module({
  providers: [MessagesGateway, MessagesService],
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    GameModule,
  ],
})
export class MessagesModule {}
