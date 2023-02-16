import { Injectable } from '@nestjs/common';
import { User } from 'src/messages/entities/user.entity';

@Injectable()
export class GameService {
  clientIdObj = {};
  round = 0;
  lead: User[];

  identify(user: User, clientId: string) {
    this.clientIdObj[clientId] = user;
    // return userName;
    return Object.values(this.clientIdObj);
  }

  changeRound() {
    this.round++;
    if (this.getClientsCount() < this.round) this.round = 0;
  }

  getCurrentLeadAndRaund() {
    const users: User[] = Object.values(this.clientIdObj);

    return {
      users: users,
      round: this.round,
    };
  }
  getClientsCount() {
    return Object.values(this.clientIdObj).length;
  }

  getClientByName(clientId: string) {
    return this.clientIdObj[clientId].name;
  }
  deleteUser(id: string) {
    delete this.clientIdObj[id];
  }

  calculateScore() {
    for (const client in this.clientIdObj) {
      if (Object.prototype.hasOwnProperty.call(this.clientIdObj, client)) {
        this.clientIdObj[client].currentScore += 500;
      }
    }
    return Object.values(this.clientIdObj);
  }
}