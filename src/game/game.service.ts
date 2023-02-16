import { Injectable } from '@nestjs/common';
import { User } from 'src/messages/entities/user.entity';

@Injectable()
export class GameService {
  timeOut: NodeJS.Timeout;
  config: any;
  private room = {
    id: -1,
    users: [],
  };
  round = 0;
  lead: User[];

  joinRoom(user: User) {
    this.room.users.push(user);
  }

  getRoomUsers() {
    return this.room.users;
  }

  changeRound() {
    this.round++;
    if (this.getClientsCount() < this.round) this.round = 0;
  }

  getCurrentLeadAndRaund() {
    return {
      users: this.getRoomUsers(),
      round: this.round,
    };
  }

  getClientsCount() {
    return this.room.users.length;
  }

  getRoomUser(clientId: string): User {
    return this.room.users.filter((u) => u.id === clientId)[0];
  }

  deleteUser(id: string) {
    this.room.users = this.room.users.filter((u) => u.id !== id);
  }

  calculateScore() {
    this.room.users.forEach((u) => {
      u.currentScore += 500;
    });
    return this.room.users;
  }

  isRoundStarted = () => this.timeOut;

  readyToStart = () => this.getClientsCount() >= 2 && !this.isRoundStarted();
}
