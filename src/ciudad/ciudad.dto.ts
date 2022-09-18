import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CiudadDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  readonly pais: string;

  @IsNumber()
  @IsNotEmpty()
  readonly numeroHabitantes: number;
}
