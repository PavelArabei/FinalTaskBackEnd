import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUser } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async getById(id: string): Promise<User> {
    return this.userModel.findById(id);
  }

  async create(user: CreateUser): Promise<User> {
    const newUser = new this.userModel(user);
    // save - оборачивает в промис
    return newUser.save();
  }

  async remove(id: string): Promise<User> {
    return this.userModel.findByIdAndRemove(id);
  }

  async update(id: string, user: CreateUser): Promise<User> {
    // new: true - создаст обьект если он не был найден
    return this.userModel.findByIdAndUpdate(id, user, { new: true });
  }
}
