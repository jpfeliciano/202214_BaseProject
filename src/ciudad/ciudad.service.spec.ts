import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/testing-config';
import { CiudadEntity } from './ciudad.entity';
import { CiudadService } from './ciudad.service';
import { faker } from '@faker-js/faker';

describe('CiudadService', () => {
  let service: CiudadService;
  let repository: Repository<CiudadEntity>;
  let ciudadesList: CiudadEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadService],
    }).compile();

    service = module.get<CiudadService>(CiudadService);
    repository = module.get<Repository<CiudadEntity>>(
      getRepositoryToken(CiudadEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    ciudadesList = [];
    for (let i = 0; i < 5; i++) {
      const ciudad: CiudadEntity = await repository.save({
        nombre: faker.address.cityName(),
        pais: faker.address.country(),
        numeroHabitantes: faker.datatype.number({ min: 10000 }),
      });
      ciudadesList.push(ciudad);
    }
  };

  it('El servicio de ciudad debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('findAll debe retornar todas las ciudades', async () => {
    const ciudades: CiudadEntity[] = await service.findAll();
    expect(ciudades).not.toBeNull();
    expect(ciudades).toHaveLength(ciudadesList.length);
  });

  it('findOne debe retornar una ciudad por id', async () => {
    const ciudadAlmacenada: CiudadEntity = ciudadesList[0];
    const ciudad: CiudadEntity = await service.findOne(ciudadAlmacenada.id);
    expect(ciudad).not.toBeNull();
    expect(ciudad.nombre).toEqual(ciudadAlmacenada.nombre);
    expect(ciudad.pais).toEqual(ciudad.pais);
    expect(ciudad.numeroHabitantes).toEqual(ciudad.numeroHabitantes);
  });

  it('findOne debe lanzar una excepcion para una ciudad no válida', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'No se encontró la ciudad con el id suministrado',
    );
  });

  it('create debe crear una ciudad nueva', async () => {
    const ciudad: CiudadEntity = {
      id: '',
      nombre: faker.address.cityName(),
      pais: 'Argentina',
      numeroHabitantes: faker.datatype.number({ min: 10000 }),
    };

    const nuevaCiudad: CiudadEntity = await service.create(ciudad);
    expect(nuevaCiudad).not.toBeNull();

    const ciudadAlmacenada: CiudadEntity = await repository.findOne({
      where: { id: nuevaCiudad.id },
    });
    expect(ciudadAlmacenada).not.toBeNull();
    expect(ciudadAlmacenada.nombre).toEqual(nuevaCiudad.nombre);
    expect(ciudadAlmacenada.pais).toEqual(nuevaCiudad.pais);
    expect(ciudadAlmacenada.numeroHabitantes).toEqual(
      nuevaCiudad.numeroHabitantes,
    );
  });

  it('create debe lanzar una excepción para una ciudad que pertenece a un país diferente a Argentina, Ecuador ó Paraguay', async () => {
    const ciudad: CiudadEntity = {
      id: '',
      nombre: faker.address.cityName(),
      pais: 'Colombia',
      numeroHabitantes: faker.datatype.number({ min: 10000 }),
    };

    await expect(() => service.create(ciudad)).rejects.toHaveProperty(
      'message',
      'El país al que pertenece la ciudad debe ser Argentina, Ecuador ó Paraguay',
    );
  });

  it('update debe modificar una ciudad', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    ciudad.nombre = 'Asunción';
    ciudad.pais = 'Paraguay';
    const ciudadActualizada: CiudadEntity = await service.update(
      ciudad.id,
      ciudad,
    );
    expect(ciudadActualizada).not.toBeNull();
    const ciudadAlmacenada: CiudadEntity = await repository.findOne({
      where: { id: ciudad.id },
    });
    expect(ciudadAlmacenada).not.toBeNull();
    expect(ciudadAlmacenada.nombre).toEqual(ciudad.nombre);
    expect(ciudadAlmacenada.pais).toEqual(ciudad.pais);
  });

  it('update debe lanzar una excepción para una ciudad no válida', async () => {
    let ciudad: CiudadEntity = ciudadesList[0];
    ciudad = {
      ...ciudad,
      nombre: 'Asunción',
      pais: 'Paraguay',
    };
    await expect(() => service.update('0', ciudad)).rejects.toHaveProperty(
      'message',
      'No se encontró la ciudad con el id suministrado',
    );
  });

  it('update debe lanzar una excepción para una ciudad que pertenece a un país diferente a Argentina, Ecuador ó Paraguay', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    ciudad.nombre = 'Bogotá';
    ciudad.pais = 'Colombia';
    await expect(() =>
      service.update(ciudad.id, ciudad),
    ).rejects.toHaveProperty(
      'message',
      'El país al que pertenece la ciudad debe ser Argentina, Ecuador ó Paraguay',
    );
  });

  it('delete debe eliminar una ciudad', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    await service.delete(ciudad.id);
    const ciudadEliminada: CiudadEntity = await repository.findOne({
      where: { id: ciudad.id },
    });
    expect(ciudadEliminada).toBeNull();
  });

  it('delete debe lanzar una excepción para una ciudad no válida', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    await service.delete(ciudad.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'No se encontró la ciudad con el id suministrado',
    );
  });
});
