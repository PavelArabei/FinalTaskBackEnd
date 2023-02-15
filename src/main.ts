import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config';

const { DEFAULT_PORT } = config;

async function letsGo() {
  const PORT = process.env.PORT || DEFAULT_PORT;
  const app = await NestFactory.create(AppModule);

  await app.listen(PORT, () => console.log(`PORT: ${PORT}`));
}

letsGo();
