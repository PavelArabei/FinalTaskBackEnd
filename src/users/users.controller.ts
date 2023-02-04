import {
  Body,
  Controller,
  Delete,
  Get,
  //Header,
  //HttpCode,
  //HttpStatus,
  Param,
  Post,
  Put,
  // Redirect,
} from '@nestjs/common';
import { CreateUser } from './dto/create-user.dto';
import { UpdateUser } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

@Controller('/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Get()
  //Редирект для запроса( куда редирект, статус код)
  //@Redirect('https://google.com', 301)
  getAll(): Promise<User[]> {
    return this.userService.getAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<User> {
    return this.userService.getById(id);
  }

  @Post()
  //статус код (какой статус)
  // @HttpCode(HttpStatus.CREATED)
  //добавление хэдоров(имя, значение)
  //@Header('Cash-Control', 'none')
  createUser(@Body() user: CreateUser) {
    return this.userService.create(user);
  }

  @Delete(':id')
  removeUser(@Param('id') id: string): Promise<User> {
    return this.userService.remove(id);
  }

  @Put(':id')
  updateUser(
    @Body() updateBody: UpdateUser,
    @Param('id') id: string,
  ): Promise<User> {
    return this.userService.update(id, updateBody);
  }
}
