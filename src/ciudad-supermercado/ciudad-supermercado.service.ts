import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CiudadEntity } from '../ciudad/ciudad.entity';
import { SupermercadoEntity } from '../supermercado/supermercado.entity';
import { Repository } from 'typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/business-errors';

@Injectable()
export class CiudadSupermercadoService {
  constructor(
    @InjectRepository(CiudadEntity)
    private readonly ciudadRepository: Repository<CiudadEntity>,

    @InjectRepository(SupermercadoEntity)
    private readonly supermercadoRepository: Repository<SupermercadoEntity>,
  ) {}

  async addSupermarketToCity(
    ciudadId: string,
    supermercadoId: string,
  ): Promise<CiudadEntity> {
    const supermercado: SupermercadoEntity =
      await this.supermercadoRepository.findOne({
        where: { id: supermercadoId },
      });
    if (!supermercado)
      throw new BusinessLogicException(
        'No se encontró un supermercado con el id suministrado',
        BusinessError.NOT_FOUND,
      );

    const ciudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id: ciudadId },
      relations: ['supermercados'],
    });
    if (!ciudad)
      throw new BusinessLogicException(
        'No se encontró la ciudad con el id suministrado',
        BusinessError.NOT_FOUND,
      );

    ciudad.supermercados = [...ciudad.supermercados, supermercado];
    return await this.ciudadRepository.save(ciudad);
  }

  async findSupermarketsFromCity(
    ciudadId: string,
  ): Promise<SupermercadoEntity[]> {
    const ciudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id: ciudadId },
      relations: ['supermercados'],
    });
    if (!ciudad)
      throw new BusinessLogicException(
        'No se encontró la ciudad con el id suministrado',
        BusinessError.NOT_FOUND,
      );

    return ciudad.supermercados;
  }

  async findSupermarketFromCity(
    ciudadId: string,
    supermercadoId: string,
  ): Promise<SupermercadoEntity> {
    const supermercado: SupermercadoEntity =
      await this.supermercadoRepository.findOne({
        where: { id: supermercadoId },
      });
    if (!supermercado)
      throw new BusinessLogicException(
        'No se encontró un supermercado con el id suministrado',
        BusinessError.NOT_FOUND,
      );

    const ciudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id: ciudadId },
      relations: ['supermercados'],
    });
    if (!ciudad)
      throw new BusinessLogicException(
        'No se encontró la ciudad con el id suministrado',
        BusinessError.NOT_FOUND,
      );

    const ciudadSupermercado: SupermercadoEntity = ciudad.supermercados.find(
      (e) => e.id === supermercado.id,
    );

    if (!ciudadSupermercado)
      throw new BusinessLogicException(
        'El supermercado con el id suministrado no está asociado con la ciudad',
        BusinessError.PRECONDITION_FAILED,
      );

    return ciudadSupermercado;
  }

  async updateSupermarketsFromCity(
    ciudadId: string,
    supermercados: SupermercadoEntity[],
  ): Promise<SupermercadoEntity> {
    const ciudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id: ciudadId },
      relations: ['supermercados'],
    });

    if (!ciudad)
      throw new BusinessLogicException(
        'No se encontró la ciudad con el id suministrado',
        BusinessError.NOT_FOUND,
      );

    for (let i = 0; i < supermercados.length; i++) {
      const supermercado: SupermercadoEntity =
        await this.supermercadoRepository.findOne({
          where: { id: supermercados[i].id },
        });
      if (!supermercado)
        throw new BusinessLogicException(
          'No se encontró un supermercado con el id suministrado',
          BusinessError.NOT_FOUND,
        );
    }

    ciudad.supermercados = supermercados;
    return await this.ciudadRepository.save(ciudad);
  }

  async deleteSupermarketFromCity(ciudadId: string, supermercadoId: string) {
    const supermercado: SupermercadoEntity =
      await this.supermercadoRepository.findOne({
        where: { id: supermercadoId },
      });
    if (!supermercado)
      throw new BusinessLogicException(
        'No se encontró un supermercado con el id suministrado',
        BusinessError.NOT_FOUND,
      );

    const ciudad: CiudadEntity = await this.ciudadRepository.findOne({
      where: { id: ciudadId },
      relations: ['supermercados'],
    });
    if (!ciudad)
      throw new BusinessLogicException(
        'No se encontró la ciudad con el id suministrado',
        BusinessError.NOT_FOUND,
      );

    const ciudadSupermercado: SupermercadoEntity = ciudad.supermercados.find(
      (e) => e.id === supermercado.id,
    );

    if (!ciudadSupermercado)
      throw new BusinessLogicException(
        'El supermercado con el id suministrado no está asociado con la ciudad',
        BusinessError.PRECONDITION_FAILED,
      );

    ciudad.supermercados = ciudad.supermercados.filter(
      (e) => e.id !== supermercadoId,
    );
    await this.ciudadRepository.save(ciudad);
  }
}
