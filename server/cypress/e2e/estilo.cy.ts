import { faker } from '@faker-js/faker';
import {
  UpsertEstiloRequestDto,
  DeleteEstiloResponseDto,
} from '@common/dto/estilo.dto';
import { UpsertPaloRequestDto } from '@common/dto/palo.dto';
import { tonalities } from '@prisma/client';
import { LoginRequestDto, LoginResponseDto } from '@common/dto/login.dto';
import { expectTypeOf } from 'expect-type';

let authToken: string;
let userAuthToken: string;
let createdPaloId: number;
let createdEstiloId: number;

describe('Estilo Upsert API', () => {
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
      authToken = response.body.token;
    });
  });

  // ✅ 2. Login as regular USER
  it('should allow USER to log in', () => {
    const loginRequest: LoginRequestDto = {
      email: userCredentials.email,
      password: userCredentials.password,
    };

    cy.request<LoginResponseDto>({
      method: 'POST',
      url: '/auth/login',
      body: loginRequest,
      headers: { 'Content-Type': 'application/json' },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('token');
      userAuthToken = response.body.token;
    });
  });

  // ✅ 3. Create a new Palo (since Estilo needs a Palo)
  it('should create a new Palo', () => {
    const newPalo: UpsertPaloRequestDto = {
      name: faker.music.genre() + ' Palo',
      origin: faker.location.city(),
      origin_date: faker.date.past().toISOString(),
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
    const newEstilo: UpsertEstiloRequestDto = {
      name: faker.music.genre() + ' Estilo',
      tonality: tonalities.MAYOR, // Replace with valid enum value from Prisma
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

  // ✅ 5. Update the existing Estilo
  it('should update an existing Estilo', () => {
    const updatedEstilo: UpsertEstiloRequestDto = {
      id: createdEstiloId,
      name: faker.music.genre() + ' Updated Estilo',
      tonality: tonalities.LOCRIO, // Replace with valid enum value
      key: 'G', // Replace with valid enum value
      origin: faker.location.city(),
      origin_date: faker.date.past().toISOString(),
      palo_id: createdPaloId,
      artist_id: null,
      user_update_id: 1, // Assume admin user ID
    };

    cy.request({
      method: 'POST',
      url: '/estilo/upsert',
      body: updatedEstilo,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id', createdEstiloId);
    });
  });

  // ❌ 6. Fail with invalid Estilo data
  it('should return 400 for invalid Estilo data', () => {
    const invalidEstilo = {};

    cy.request({
      method: 'POST',
      url: '/estilo/upsert',
      body: invalidEstilo,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false, // Allow 4xx responses
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  // ❌ 7. Fail without authentication
  it('should return 401 Unauthorized when no token is provided', () => {
    const estiloWithoutAuth = {
      name: faker.music.genre() + ' Estilo',
      origin: faker.location.city(),
      origin_date: faker.date.past().toISOString(),
      palo_id: createdPaloId,
    };

    cy.request({
      method: 'POST',
      url: '/estilo/upsert',
      body: estiloWithoutAuth,
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false, // Allow 4xx responses
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // ❌ 8. Fail when user is not MASTER role
  it('should return 403 Forbidden when user is not MASTER', () => {
    const estiloWithUnauthorizedRole = {
      name: faker.music.genre() + ' Estilo',
      origin: faker.location.city(),
      origin_date: faker.date.past().toISOString(),
      palo_id: createdPaloId,
    };

    cy.request({
      method: 'POST',
      url: '/estilo/upsert',
      body: estiloWithUnauthorizedRole,
      headers: {
        Authorization: `Bearer ${userAuthToken}`, // Regular user token
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false, // Allow 4xx responses
    }).then((response) => {
      expect(response.status).to.eq(403);
    });
  });

  // ✅ Test: Delete a Estilo
  it('should delete a Estilo', () => {
    cy.request({
      method: 'DELETE',
      url: '/estilo/delete',
      body: { id: createdEstiloId },
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expectTypeOf(response.body).toMatchTypeOf<DeleteEstiloResponseDto>();
      expect(response.body).to.have.property('id', createdEstiloId);
      expect(response.status).to.eq(200);
    });
  });
});
