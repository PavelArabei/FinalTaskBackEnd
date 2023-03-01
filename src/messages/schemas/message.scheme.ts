import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema()
export class Message {
  @Prop()
  name: string;

  @Prop()
  text: string;

  @Prop()
  id: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
