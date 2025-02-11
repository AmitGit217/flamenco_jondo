import { expectTypeOf } from 'expect-type';
import { faker } from '@faker-js/faker';
import {
  UpsertLetraRequestDto,
  UpsrtLetraResponseDto,
  DeleteLetraResponseDto,
} from '@common/dto/letra.dto';
import { LoginRequestDto, LoginResponseDto } from '@common/dto/login.dto';
import { tonalities } from '@prisma/client';

let authToken: string;
let userAuthToken: string;
let createdLetraId: number;
let createdArtistId: number;
let createdPaloId: number;
let createdEstiloId: number;

describe('Letra Upsert API', () => {
  const adminCredentials = {
    email: 'amit217@yandex.com', // Replace with MASTER user email
    password: '21780Amit', // Replace with MASTER user password
  };

  const userCredentials = {
    email: 'test@email.com',
    password: '123456',
  };

  // ✅ 1. Login as MASTER user
  it('should allow MASTER user to log in', () => {
    const loginRequest: LoginRequestDto = {
      email: adminCredentials.email,
      password: adminCredentials.password,
    };

    cy.request<LoginResponseDto>({
      method: 'POST',
      url: '/auth/login',
      body: loginRequest,
      headers: { 'Content-Type': 'application/json' },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('token');
      expectTypeOf(response.body).toMatchTypeOf<LoginResponseDto>();
      authToken = response.body.token;
    });
  });

  // ✅ 2. Create a new Artist
  it('should create a new Artist', () => {
    const newArtist = {
      name: faker.person.fullName(),
      type: 'CANTE', // Replace with a valid enum value
      user_created_id: 1,
    };

    cy.request({
      method: 'POST',
      url: '/artist/upsert',
      body: newArtist,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      createdArtistId = response.body.id;
    });
  });

  // ✅ 3. Create a new Palo
  it('should create a new Palo', () => {
    const newPalo = {
      name: faker.music.genre() + ' Palo',
      origin: faker.location.city(),
      origin_date: faker.date.past().toISOString(),
      user_created_id: 1,
    };

    cy.request({
      method: 'POST',
      url: '/palo/upsert',
      body: newPalo,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      createdPaloId = response.body.id;
    });
  });

  // ✅ 4. Create a new Estilo
  it('should create a new Estilo', () => {
    const newEstilo = {
      name: faker.music.genre() + ' Estilo',
      tonality: tonalities.MAIOR, // Replace with valid enum value from Prisma
      key: 'C', // Replace with valid enum value from Prisma
      origin: faker.location.city(),
      origin_date: faker.date.past().toISOString(),
      palo_id: createdPaloId,
      artist_id: null,
      user_created_id: 1, // Assume admin user ID
    };

    cy.request({
      method: 'POST',
      url: '/estilo/upsert',
      body: newEstilo,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      createdEstiloId = response.body.id;
    });
  });

  // ✅ 5. Create a new Letra (Now using real Artist, Palo, and Estilo IDs)
  it('should create a new Letra', () => {
    const newLetra: UpsertLetraRequestDto = {
      estilo_id: createdEstiloId,
      artist_id: createdArtistId,
      palo_id: createdPaloId,
      verses: [
        'Caminito de la fuente',
        'yo me puse a caminar',
        'y las piedras del camino',
        'se pusieron a llorar',
      ],
      rhyme_scheme: [1, 3, 2, 4],
      repetition_pattern: [1, 2, 1, 3],
      structure: 'ABCB',
      user_created_id: 1,
    };

    cy.request<UpsrtLetraResponseDto>({
      method: 'POST',
      url: '/letra/upsert',
      body: newLetra,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      expectTypeOf(response.body).toMatchTypeOf<UpsrtLetraResponseDto>();
      createdLetraId = response.body.id;
    });
  });

  // ✅ 6. Update the existing Letra
  it('should update an existing Letra', () => {
    const updatedLetra: UpsertLetraRequestDto = {
      id: createdLetraId,
      estilo_id: createdEstiloId,
      artist_id: createdArtistId,
      palo_id: createdPaloId,
      verses: [
        'Por la vereda yo anduve',
        'y el viento me susurró',
        'las palabras que en el alma',
        'se quedaron con ardor',
      ],
      rhyme_scheme: [2, 4, 1, 3],
      repetition_pattern: [2, 1, 3, 1],
      structure: 'ABAB',
      user_update_id: 1,
    };

    cy.request<UpsrtLetraResponseDto>({
      method: 'POST',
      url: '/letra/upsert',
      body: updatedLetra,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id', createdLetraId);
      expectTypeOf(response.body).toMatchTypeOf<UpsrtLetraResponseDto>();
    });
  });

  // ✅ 7. Delete the Letra
  it('should delete a Letra', () => {
    cy.request({
      method: 'DELETE',
      url: '/letra/delete',
      body: { id: createdLetraId },
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expectTypeOf(response.body).toMatchTypeOf<DeleteLetraResponseDto>();
      expect(response.body).to.have.property('id', createdLetraId);
    });
  });
});
