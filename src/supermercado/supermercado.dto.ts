import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SupermercadoDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsNumber()
  @IsNotEmpty()
  readonly longitud: number;

  @IsNumber()
  @IsNotEmpty()
  readonly latitud: number;

  @IsString()
  @IsNotEmpty()
  readonly paginaWeb: string;
}
