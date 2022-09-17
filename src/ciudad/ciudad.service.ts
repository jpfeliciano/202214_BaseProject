import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/business-errors';
import { Repository } from 'typeorm';
import { CiudadEntity } from './ciudad.entity';

@Injectable()
export class CiudadService {
  constructor(
    @InjectRepository(CiudadEntity)
    private readonly ciudadRepository: Repository<CiudadEntity>,
  ) {}

  async findAll(): Promise<CiudadEntity[]> {
    return await this.ciudadRepository.find({
      relations: ['supermercados'],
    });
  }

  async findOne(id: string): Promise<CiudadEntity> {
    const ciudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id },
      relations: ['supermercados'],
    });
    if (!ciudad)
      throw new BusinessLogicException(
        'No se encontró la ciudad con el id suministrado',
        BusinessError.NOT_FOUND,
      );

    return ciudad;
  }

  async create(ciudad: CiudadEntity): Promise<CiudadEntity> {
    this.validarPais(ciudad.pais);
    return await this.ciudadRepository.save(ciudad);
  }

  async update(id: string, ciudad: CiudadEntity): Promise<CiudadEntity> {
    this.validarPais(ciudad.pais);
    const persistedCiudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id },
    });
    if (!persistedCiudad)
      throw new BusinessLogicException(
        'No se encontró la ciudad con el id suministrado',
        BusinessError.NOT_FOUND,
      );

    return await this.ciudadRepository.save({ ...persistedCiudad, ...ciudad });
  }

  async delete(id: string) {
    const ciudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id },
    });
    if (!ciudad)
      throw new BusinessLogicException(
        'No se encontró la ciudad con el id suministrado',
        BusinessError.NOT_FOUND,
      );

    await this.ciudadRepository.remove(ciudad);
  }

  private validarPais(nombrePais: string) {
    if (
      nombrePais != 'Argentina' &&
      nombrePais != 'Ecuador' &&
      nombrePais != 'Paraguay'
    ) {
      throw new BusinessLogicException(
        'El país al que pertenece la ciudad debe ser Argentina, Ecuador ó Paraguay',
        BusinessError.NOT_FOUND,
      );
    }
  }
}
