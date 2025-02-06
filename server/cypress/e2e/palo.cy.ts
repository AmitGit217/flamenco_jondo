import { faker } from '@faker-js/faker';
import { UpsertPaloRequestDto } from '@common/dto/palo.dto';
import { LoginRequestDto, LoginResponseDto } from '@common/dto/login.dto';
let authToken: string;
let userAuthToken: string;

describe('Palo Upsert API', () => {
  const adminCredentials = {
    email: 'amit217@yandex.com', // Set your actual MASTER user email
    password: '21780Amit', // Set your actual MASTER user password
  };

  const userCredentials = {
    email: 'test@email.com',
    password: '123456',
  };

  let createdPaloId: number;

  // ✅ Test: Login as MASTER user
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

  it('should allow USER user to log in', () => {
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

  // ✅ Test: Create a new Palo
  it('should create a new palo', () => {
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

  // ✅ Test: Update an existing Palo
  it('should update an existing palo', () => {
    const updatedPalo: UpsertPaloRequestDto = {
      id: createdPaloId,
      name: faker.music.genre() + ' Updated Palo',
      origin: faker.location.city(),
      origin_date: faker.date.past().toISOString(),
    };

    cy.request({
      method: 'POST',
      url: '/palo/upsert',
      body: updatedPalo,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id', createdPaloId);
    });
  });

  // ❌ Test: Fail with invalid data
  it('should return 400 for invalid palo data', () => {
    const invalidPalo = {};

    cy.request({
      method: 'POST',
      url: '/palo/upsert',
      body: invalidPalo,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false, // Allow 4xx responses
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  // ❌ Test: Fail without authentication
  it('should return 401 Unauthorized when no token is provided', () => {
    const paloWithoutAuth = {
      name: faker.music.genre() + ' Palo',
      origin: faker.location.city(),
      origin_date: faker.date.past().toISOString(),
    };

    cy.request({
      method: 'POST',
      url: '/palo/upsert',
      body: paloWithoutAuth,
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false, // Allow 4xx responses
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // ❌ Test: Fail when user is not MASTER role
  it('should return 403 Forbidden when user is not MASTER', () => {
    const paloWithUnauthorizedRole = {
      name: faker.music.genre() + ' Palo',
      description: faker.lorem.sentence(),
      origin: faker.location.city(),
      origin_date: faker.date.past().toISOString(),
    };

    cy.request({
      method: 'POST',
      url: '/palo/upsert',
      body: paloWithUnauthorizedRole,
      headers: {
        Authorization: `Bearer ${userAuthToken}`, // Assume this token is from a non-MASTER user
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false, // Allow 4xx responses
    }).then((response) => {
      expect(response.status).to.eq(403);
    });
  });
});
