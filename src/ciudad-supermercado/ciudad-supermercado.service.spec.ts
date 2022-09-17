import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CiudadEntity } from '../ciudad/ciudad.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/testing-config';
import { SupermercadoEntity } from '../supermercado/supermercado.entity';
import { Repository } from 'typeorm';
import { CiudadSupermercadoService } from './ciudad-supermercado.service';

describe('CiudadSupermercadoService', () => {
  let service: CiudadSupermercadoService;
  let ciudadRepository: Repository<CiudadEntity>;
  let supermercadoRepository: Repository<SupermercadoEntity>;
  let ciudad: CiudadEntity;
  let supermercadosList: SupermercadoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadSupermercadoService],
    }).compile();

    service = module.get<CiudadSupermercadoService>(CiudadSupermercadoService);
    ciudadRepository = module.get<Repository<CiudadEntity>>(
      getRepositoryToken(CiudadEntity),
    );
    supermercadoRepository = module.get<Repository<SupermercadoEntity>>(
      getRepositoryToken(SupermercadoEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    supermercadoRepository.clear();
    ciudadRepository.clear();

    supermercadosList = [];
    for (let i = 0; i < 5; i++) {
      const supermercado: SupermercadoEntity =
        await supermercadoRepository.save({
          nombre: faker.random.alpha(10),
          longitud: parseInt(faker.address.longitude()),
          latitud: parseInt(faker.address.latitude()),
          paginaWeb: faker.internet.url(),
        });
      supermercadosList.push(supermercado);
    }

    ciudad = await ciudadRepository.save({
      nombre: faker.address.cityName(),
      pais: faker.address.country(),
      numeroHabitantes: faker.datatype.number({ min: 10000 }),
      supermercados: supermercadosList,
    });
  };

  it('El servicio CiudadSupermercadoService debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('addSupermarketToCity debe adicionar un supermercado a una ciudad', async () => {
    const supermercadoNuevo: SupermercadoEntity =
      await supermercadoRepository.save({
        nombre: faker.random.alpha(10),
        longitud: parseInt(faker.address.longitude()),
        latitud: parseInt(faker.address.latitude()),
        paginaWeb: faker.internet.url(),
      });

    const ciudad: CiudadEntity = await ciudadRepository.save({
      nombre: faker.address.cityName(),
      pais: faker.address.country(),
      numeroHabitantes: faker.datatype.number({ min: 10000 }),
    });

    const resultado: CiudadEntity = await service.addSupermarketToCity(
      ciudad.id,
      supermercadoNuevo.id,
    );

    expect(resultado.supermercados.length).toBe(1);
    expect(resultado.supermercados[0]).not.toBeNull();
    expect(resultado.supermercados[0].nombre).toBe(supermercadoNuevo.nombre);
    expect(resultado.supermercados[0].longitud).toBe(
      supermercadoNuevo.longitud,
    );
    expect(resultado.supermercados[0].latitud).toBe(supermercadoNuevo.latitud);
    expect(resultado.supermercados[0].paginaWeb).toBe(
      supermercadoNuevo.paginaWeb,
    );
  });

  it('addSupermarketToCity debe lanzar una excepción para un id de supermercado no válido', async () => {
    const ciudadNueva: CiudadEntity = await ciudadRepository.save({
      nombre: faker.address.cityName(),
      pais: faker.address.country(),
      numeroHabitantes: faker.datatype.number({ min: 10000 }),
    });

    await expect(() =>
      service.addSupermarketToCity(ciudadNueva.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró un supermercado con el id suministrado',
    );
  });

  it('addSupermarketToCity debe lanzar una excepción para un id de ciudad no válido', async () => {
    const supermercadoNuevo: SupermercadoEntity =
      await supermercadoRepository.save({
        nombre: faker.random.alpha(10),
        longitud: parseInt(faker.address.longitude()),
        latitud: parseInt(faker.address.latitude()),
        paginaWeb: faker.internet.url(),
      });

    await expect(() =>
      service.addSupermarketToCity('0', supermercadoNuevo.id),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró la ciudad con el id suministrado',
    );
  });

  it('findSupermarketFromCity debe retornar un supermercado asociado a una ciudad', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    const supermercadoAlmacenado: SupermercadoEntity =
      await service.findSupermarketFromCity(ciudad.id, supermercado.id);
    expect(supermercadoAlmacenado).not.toBeNull();
    expect(supermercadoAlmacenado.nombre).toBe(supermercado.nombre);
    expect(supermercadoAlmacenado.longitud).toBe(supermercado.longitud);
    expect(supermercadoAlmacenado.latitud).toBe(supermercado.latitud);
    expect(supermercadoAlmacenado.paginaWeb).toBe(supermercado.paginaWeb);
  });

  it('findSupermarketFromCity debe lanzar una excepción para un supermercado no válido', async () => {
    await expect(() =>
      service.findSupermarketFromCity(ciudad.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró un supermercado con el id suministrado',
    );
  });

  it('findSupermarketFromCity debe lanzar una excepción para una ciudad no válida', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    await expect(() =>
      service.findSupermarketFromCity('0', supermercado.id),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró la ciudad con el id suministrado',
    );
  });

  it('findSupermarketFromCity debe lanzar una excepción para un producto que no ha sido asociado a una ciudad', async () => {
    const supermercadoNuevo: SupermercadoEntity =
      await supermercadoRepository.save({
        nombre: faker.random.alpha(10),
        longitud: parseInt(faker.address.longitude()),
        latitud: parseInt(faker.address.latitude()),
        paginaWeb: faker.internet.url(),
      });

    await expect(() =>
      service.findSupermarketFromCity(ciudad.id, supermercadoNuevo.id),
    ).rejects.toHaveProperty(
      'message',
      'El supermercado con el id suministrado no está asociado con la ciudad',
    );
  });

  it('findSupermarketsFromCity debe retornar los supermercados de una ciudad', async () => {
    const supermercados: SupermercadoEntity[] =
      await service.findSupermarketsFromCity(ciudad.id);
    expect(supermercados.length).toBe(5);
  });

  it('findSupermarketsFromCity debe lanzar una excepción para una ciudad no válida', async () => {
    await expect(() =>
      service.findSupermarketsFromCity('0'),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró la ciudad con el id suministrado',
    );
  });

  it('updateSupermarketsFromCity debe actualizar la lista de supermercados asociadas a una ciudad', async () => {
    const supermercadoNuevo: SupermercadoEntity =
      await supermercadoRepository.save({
        nombre: faker.random.alpha(10),
        longitud: parseInt(faker.address.longitude()),
        latitud: parseInt(faker.address.latitude()),
        paginaWeb: faker.internet.url(),
      });

    const ciudadActualizada: CiudadEntity =
      await service.updateSupermarketsFromCity(ciudad.id, [supermercadoNuevo]);
    expect(ciudadActualizada.supermercados.length).toBe(1);

    expect(ciudadActualizada.supermercados[0].nombre).toBe(
      supermercadoNuevo.nombre,
    );
    expect(ciudadActualizada.supermercados[0].latitud).toBe(
      supermercadoNuevo.latitud,
    );
    expect(ciudadActualizada.supermercados[0].longitud).toBe(
      supermercadoNuevo.longitud,
    );
    expect(ciudadActualizada.supermercados[0].paginaWeb).toBe(
      supermercadoNuevo.paginaWeb,
    );
  });

  it('updateSupermarketsFromCity debe lanzar una excepcion para una ciudad no válida', async () => {
    const supermercadoNuevo: SupermercadoEntity =
      await supermercadoRepository.save({
        nombre: faker.random.alpha(10),
        longitud: parseInt(faker.address.longitude()),
        latitud: parseInt(faker.address.latitude()),
        paginaWeb: faker.internet.url(),
      });

    await expect(() =>
      service.updateSupermarketsFromCity('0', [supermercadoNuevo]),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró la ciudad con el id suministrado',
    );
  });

  it('updateSupermarketsFromCity debe lanzar una excepcion para un supermercado no válido', async () => {
    const supermercadoNuevo: SupermercadoEntity = supermercadosList[0];
    supermercadoNuevo.id = '0';

    await expect(() =>
      service.updateSupermarketsFromCity(ciudad.id, [supermercadoNuevo]),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró un supermercado con el id suministrado',
    );
  });

  it('deleteSupermarketFromCity debe eliminar un supermercado de una ciudad', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];

    await service.deleteSupermarketFromCity(ciudad.id, supermercado.id);

    const ciudadAlmacenada: CiudadEntity = await ciudadRepository.findOne({
      where: { id: ciudad.id },
      relations: ['supermercados'],
    });
    const supermercadoEliminado: SupermercadoEntity =
      ciudadAlmacenada.supermercados.find((a) => a.id === supermercado.id);

    expect(supermercadoEliminado).toBeUndefined();
  });

  it('deleteSupermarketFromCity debe lanzar una excepcion para un supermercado no válido', async () => {
    await expect(() =>
      service.deleteSupermarketFromCity(ciudad.id, '0'),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró un supermercado con el id suministrado',
    );
  });

  it('deleteSupermarketFromCity debe lanzar una excepcion para una ciudad no válida', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    await expect(() =>
      service.deleteSupermarketFromCity('0', supermercado.id),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró la ciudad con el id suministrado',
    );
  });

  it('deleteSupermarketFromCity debe lanzar una excepcion para un supermercado no asociado a una ciudad', async () => {
    const supermercadoNuevo: SupermercadoEntity =
      await supermercadoRepository.save({
        nombre: faker.random.alpha(10),
        longitud: parseInt(faker.address.longitude()),
        latitud: parseInt(faker.address.latitude()),
        paginaWeb: faker.internet.url(),
      });

    await expect(() =>
      service.deleteSupermarketFromCity(ciudad.id, supermercadoNuevo.id),
    ).rejects.toHaveProperty(
      'message',
      'El supermercado con el id suministrado no está asociado con la ciudad',
    );
  });
});
