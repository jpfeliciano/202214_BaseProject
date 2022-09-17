import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/testing-config';
import { SupermercadoEntity } from './supermercado.entity';
import { SupermercadoService } from './supermercado.service';
import { faker } from '@faker-js/faker';

describe('SupermercadoService', () => {
  let service: SupermercadoService;
  let repository: Repository<SupermercadoEntity>;
  let supermercadosList: SupermercadoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SupermercadoService],
    }).compile();

    service = module.get<SupermercadoService>(SupermercadoService);
    repository = module.get<Repository<SupermercadoEntity>>(
      getRepositoryToken(SupermercadoEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    supermercadosList = [];
    for (let i = 0; i < 5; i++) {
      const supermercado: SupermercadoEntity = await repository.save({
        nombre: faker.company.name(),
        longitud: parseInt(faker.address.longitude()),
        latitud: parseInt(faker.address.latitude()),
        paginaWeb: faker.internet.url(),
      });
      supermercadosList.push(supermercado);
    }
  };

  it('El servicio de supermercados debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('findAll debe retornar todos los supermercados', async () => {
    const supermercados: SupermercadoEntity[] = await service.findAll();
    expect(supermercados).not.toBeNull();
    expect(supermercados).toHaveLength(supermercadosList.length);
  });

  it('findOne debe retornar un supermercado por id', async () => {
    const supermercadoAlmacenado: SupermercadoEntity = supermercadosList[0];
    const supermercado: SupermercadoEntity = await service.findOne(
      supermercadoAlmacenado.id,
    );
    expect(supermercado).not.toBeNull();
    expect(supermercado.nombre).toEqual(supermercadoAlmacenado.nombre);
    expect(supermercado.longitud).toEqual(supermercado.longitud);
    expect(supermercado.latitud).toEqual(supermercado.latitud);
    expect(supermercado.paginaWeb).toEqual(supermercado.paginaWeb);
  });

  it('findOne debe lanzar una excepcion para un supermercado no válido', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'No se encontró un supermercado con el id suministrado',
    );
  });

  it('create debe crear un supermercado', async () => {
    const supermercado: SupermercadoEntity = {
      id: '',
      nombre: faker.random.alpha(10),
      longitud: parseInt(faker.address.longitude()),
      latitud: parseInt(faker.address.latitude()),
      paginaWeb: faker.internet.url(),
    };

    const nuevoSupermercado: SupermercadoEntity = await service.create(
      supermercado,
    );
    expect(nuevoSupermercado).not.toBeNull();

    const supermercadoAlmacenado: SupermercadoEntity = await repository.findOne(
      {
        where: { id: nuevoSupermercado.id },
      },
    );
    expect(supermercadoAlmacenado).not.toBeNull();
    expect(supermercadoAlmacenado.nombre).toEqual(nuevoSupermercado.nombre);
    expect(supermercadoAlmacenado.longitud).toEqual(nuevoSupermercado.longitud);
    expect(supermercadoAlmacenado.latitud).toEqual(nuevoSupermercado.latitud);
    expect(supermercadoAlmacenado.paginaWeb).toEqual(
      nuevoSupermercado.paginaWeb,
    );
  });

  it('create debe lanzar una excepción para un supermercado con un nombre cuya longitud es inferior a 10 caracteres', async () => {
    const supermercado: SupermercadoEntity = {
      id: '',
      nombre: 'D1',
      longitud: parseInt(faker.address.longitude()),
      latitud: parseInt(faker.address.latitude()),
      paginaWeb: faker.internet.url(),
    };

    await expect(() => service.create(supermercado)).rejects.toHaveProperty(
      'message',
      'El nombre del supermercado debe tener más de 10 caracteres',
    );
  });

  it('update debe modificar un supermercado', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    supermercado.nombre = faker.random.alpha(10);
    supermercado.longitud = parseInt(faker.address.longitude());
    const supermercadoActualizado: SupermercadoEntity = await service.update(
      supermercado.id,
      supermercado,
    );
    expect(supermercadoActualizado).not.toBeNull();
    const supermercadoAlmacenado: SupermercadoEntity = await repository.findOne(
      {
        where: { id: supermercado.id },
      },
    );
    expect(supermercadoAlmacenado).not.toBeNull();
    expect(supermercadoAlmacenado.nombre).toEqual(supermercado.nombre);
    expect(supermercadoAlmacenado.longitud).toEqual(supermercado.longitud);
  });

  it('update debe lanzar una excepción para un supermercado no válido', async () => {
    let supermercado: SupermercadoEntity = supermercadosList[0];
    supermercado = {
      ...supermercado,
      nombre: faker.random.alpha(10),
      longitud: parseInt(faker.address.longitude()),
    };
    await expect(() =>
      service.update('0', supermercado),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró un supermercado con el id suministrado',
    );
  });

  it('update debe lanzar una excepción para un supermercado con un nombre cuya longitud es inferior a 10 caracteres', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    supermercado.nombre = 'D1';
    supermercado.longitud = parseInt(faker.address.longitude());
    await expect(() =>
      service.update(supermercado.id, supermercado),
    ).rejects.toHaveProperty(
      'message',
      'El nombre del supermercado debe tener más de 10 caracteres',
    );
  });

  it('delete debe eliminar un supermercado', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    await service.delete(supermercado.id);
    const supermercadoEliminado: SupermercadoEntity = await repository.findOne({
      where: { id: supermercado.id },
    });
    expect(supermercadoEliminado).toBeNull();
  });

  it('delete debe lanzar una excepción para un supermercado no válido', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    await service.delete(supermercado.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'No se encontró un supermercado con el id suministrado',
    );
  });
});
