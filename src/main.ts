import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function letsGo() {
  const PORT = process.env.PORT || 4444;
  const app = await NestFactory.create(AppModule);

  await app.listen(PORT, () => console.log(`PORT: ${PORT}`));
}

letsGo();
