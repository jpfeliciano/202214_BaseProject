import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CiudadEntity } from 'src/ciudad/ciudad.entity';
import { CiudadSupermercadoService } from './ciudad-supermercado.service';

@Module({
  imports: [TypeOrmModule.forFeature([CiudadEntity])],
  providers: [CiudadSupermercadoService],
})
export class CiudadSupermercadoModule {}
