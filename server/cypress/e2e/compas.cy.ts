import { expectTypeOf } from 'expect-type';
import { faker } from '@faker-js/faker';
import {
  UpsertCompasRequestDto,
  UpsertCompasResponseDto,
  DeleteCompasRequestDto,
  DeleteCompasResponseDto,
} from '@common/dto/compas.dto';
import { LoginRequestDto, LoginResponseDto } from '@common/dto/login.dto';

let authToken: string;
let userAuthToken: string;
let createdCompasId: number;

describe('Compas Upsert API', () => {
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
      expectTypeOf(response.body).toMatchTypeOf<LoginResponseDto>();
      userAuthToken = response.body.token;
    });
  });

  // ✅ 3. Create a new Compas
  it('should create a new Compas', () => {
    const newCompas: UpsertCompasRequestDto = {
      name: faker.music.genre() + ' Compas',
      beats: faker.number.int({ min: 2, max: 12 }),
      accents: [1, 4, 7, 10], // Example accents
      silences: [3, 6, 9], // Example silences
      time_signatures: ['4/4', '3/4'],
      bpm: faker.number.int({ min: 60, max: 180 }),
      user_create_id: 1, // Assume admin user ID
    };

    cy.request<UpsertCompasResponseDto>({
      method: 'POST',
      url: '/compas/upsert',
      body: newCompas,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      expectTypeOf(response.body).toMatchTypeOf<UpsertCompasResponseDto>();
      createdCompasId = response.body.id;
    });
  });

  // ✅ 4. Update the existing Compas
  it('should update an existing Compas', () => {
    const updatedCompas: UpsertCompasRequestDto = {
      id: createdCompasId,
      name: faker.music.genre() + ' Updated Compas',
      beats: faker.number.int({ min: 2, max: 12 }),
      accents: [2, 5, 8, 11], // Example updated accents
      silences: [1, 3, 6], // Example updated silences
      time_signatures: ['2/4', '6/8'],
      bpm: faker.number.int({ min: 70, max: 190 }),
      user_create_id: 1, // Assume admin user ID
      user_update_id: 1, // Assume admin user ID
    };

    cy.request<UpsertCompasResponseDto>({
      method: 'POST',
      url: '/compas/upsert',
      body: updatedCompas,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id', createdCompasId);
      expectTypeOf(response.body).toMatchTypeOf<UpsertCompasResponseDto>();
    });
  });

  // ❌ 5. Fail with invalid Compas data
  it('should return 400 for invalid Compas data', () => {
    const invalidCompas = {};

    cy.request({
      method: 'POST',
      url: '/compas/upsert',
      body: invalidCompas,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false, // Allow 4xx responses
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  // ❌ 6. Fail without authentication
  it('should return 401 Unauthorized when no token is provided', () => {
    const compasWithoutAuth = {
      name: faker.music.genre() + ' Compas',
      beats: faker.number.int({ min: 2, max: 12 }),
      accents: [1, 4, 7],
      silences: [3, 6],
      time_signatures: ['4/4'],
      bpm: faker.number.int({ min: 60, max: 180 }),
    };

    cy.request({
      method: 'POST',
      url: '/compas/upsert',
      body: compasWithoutAuth,
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false, // Allow 4xx responses
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // ❌ 7. Fail when user is not MASTER role
  it('should return 403 Forbidden when user is not MASTER', () => {
    const compasWithUnauthorizedRole = {
      name: faker.music.genre() + ' Compas',
      beats: faker.number.int({ min: 2, max: 12 }),
      accents: [1, 4, 7],
      silences: [3, 6],
      time_signatures: ['3/4'],
      bpm: faker.number.int({ min: 60, max: 180 }),
    };

    cy.request({
      method: 'POST',
      url: '/compas/upsert',
      body: compasWithUnauthorizedRole,
      headers: {
        Authorization: `Bearer ${userAuthToken}`, // Regular user token
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false, // Allow 4xx responses
    }).then((response) => {
      expect(response.status).to.eq(403);
    });
  });

  // ✅ Test: Delete a Compas
  it('should delete a Compas', () => {
    cy.request({
      method: 'DELETE',
      url: `/compas/${createdCompasId}`,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expectTypeOf(response.body).toMatchTypeOf<DeleteCompasResponseDto>();
      expect(response.body).to.have.property('id', createdCompasId);
    });
  });
});
