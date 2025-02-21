import { expectTypeOf } from 'expect-type';
import { faker } from '@faker-js/faker';
import {
  UpsertArtistRequestDto,
  UpsertArtistResponseDto,
  DeleteArtistResponseDto,
} from '@common/dto/artist.dto';
import { LoginRequestDto, LoginResponseDto } from '@common/dto/login.dto';

let authToken: string;
let userAuthToken: string;
let createdArtistId: number;

describe('Artist Upsert API', () => {
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

  // ✅ 3. Create a new Artist
  it('should create a new Artist', () => {
    const newArtist: UpsertArtistRequestDto = {
      name: faker.person.fullName(),
      birth_year: faker.number.int({ min: 1900, max: 2022 }),
      death_year: faker.number.int({ min: 2023, max: 2025 }),
      origin: faker.location.city(),
      type: 'GUITARRA', // Replace with valid enum value from Prisma
      user_create_id: 1, // Assume admin user ID
    };

    cy.request<UpsertArtistResponseDto>({
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
      expectTypeOf(response.body).toMatchTypeOf<UpsertArtistResponseDto>();
      createdArtistId = response.body.id;
    });
  });

  // ✅ 4. Update the existing Artist
  it('should update an existing Artist', () => {
    const updatedArtist: UpsertArtistRequestDto = {
      id: createdArtistId,
      name: faker.person.fullName(),
      birth_year: faker.number.int({ min: 1900, max: 2000 }),
      death_year: faker.number.int({ min: 2021, max: 2025 }),
      origin: faker.location.city(),
      type: 'CANTE', // Replace with valid enum value from Prisma
      user_update_id: 1, // Assume admin user ID
    };

    cy.request<UpsertArtistResponseDto>({
      method: 'POST',
      url: '/artist/upsert',
      body: updatedArtist,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id', createdArtistId);
      expectTypeOf(response.body).toMatchTypeOf<UpsertArtistResponseDto>();
    });
  });

  // ❌ 5. Fail with invalid Artist data
  it('should return 400 for invalid Artist data', () => {
    const invalidArtist = {};

    cy.request({
      method: 'POST',
      url: '/artist/upsert',
      body: invalidArtist,
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
    const artistWithoutAuth = {
      name: faker.person.fullName(),
      origin: faker.location.city(),
      birth_year: faker.number.int({ min: 1900, max: 2022 }),
      type: 'CANTE',
    };

    cy.request({
      method: 'POST',
      url: '/artist/upsert',
      body: artistWithoutAuth,
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false, // Allow 4xx responses
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // ❌ 7. Fail when user is not MASTER role
  it('should return 403 Forbidden when user is not MASTER', () => {
    const artistWithUnauthorizedRole = {
      name: faker.person.fullName(),
      origin: faker.location.city(),
      birth_year: faker.number.int({ min: 1900, max: 2022 }),
      type: 'CANTE',
    };

    cy.request({
      method: 'POST',
      url: '/artist/upsert',
      body: artistWithUnauthorizedRole,
      headers: {
        Authorization: `Bearer ${userAuthToken}`, // Regular user token
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false, // Allow 4xx responses
    }).then((response) => {
      expect(response.status).to.eq(403);
    });
  });

  // ✅ Test: Delete a Artist
  it('should delete a Artist', () => {
    cy.request({
      method: 'DELETE',
      url: `/artist/${createdArtistId}`,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expectTypeOf(response.body).toMatchTypeOf<DeleteArtistResponseDto>();
      expect(response.body).to.have.property('id', createdArtistId);
    });
  });
});
