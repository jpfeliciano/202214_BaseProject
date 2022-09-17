import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CiudadEntity } from './ciudad/ciudad.entity';
import { CiudadModule } from './ciudad/ciudad.module';
import { SupermercadoEntity } from './supermercado/supermercado.entity';
import { SupermercadoModule } from './supermercado/supermercado.module';

@Module({
  imports: [
    CiudadModule,
    SupermercadoModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'oferta_supermercados_ciudades',
      entities: [CiudadEntity, SupermercadoEntity],
      dropSchema: true,
      synchronize: true,
      keepConnectionAlive: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
