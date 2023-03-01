import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  hey() {
    return 'hello';
  }
}
