import { expectTypeOf } from 'expect-type';
import { faker } from '@faker-js/faker';
import {
  UpsertLetraRequestDto,
  UpsrtLetraResponseDto,
  DeleteLetraResponseDto,
} from '@common/dto/letra.dto';
import { LoginRequestDto, LoginResponseDto } from '@common/dto/login.dto';
import { tonalities } from '@prisma/client';
import * as fs from 'fs';

let authToken: string;
let createdLetraId: number;
let createdArtistId: number;
let createdPaloId: number;
let createdEstiloId: number;

describe('Letra Upsert API', () => {
  const adminCredentials = {
    email: 'amit217@yandex.com', // Replace with MASTER user email
    password: '21780Amit', // Replace with MASTER user password
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

  // ✅ 2. Create necessary resources before Letra
  it('should create an Artist, Palo, and Estilo', () => {
    cy.request({
      method: 'POST',
      url: '/artist/upsert',
      body: { name: faker.person.fullName(), type: 'CANTE', user_create_id: 1 },
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      createdArtistId = response.body.id;
    });

    cy.request({
      method: 'POST',
      url: '/palo/upsert',
      body: {
        name: faker.music.genre() + ' Palo',
        origin: faker.location.city(),
        user_create_id: 1,
      },
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      createdPaloId = response.body.id;
    });

    cy.request({
      method: 'POST',
      url: '/estilo/upsert',
      body: {
        name: faker.music.genre() + ' Estilo',
        tonality: tonalities.MAYOR,
        key: 'C',
        origin: faker.location.city(),
        palo_id: createdPaloId,
        user_create_id: 1,
      },
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      createdEstiloId = response.body.id;
    });
  });

  // ✅ 3. Create a new Letra **WITHOUT** recording
  it('should create a new Letra (without recording)', () => {
    const newLetra: UpsertLetraRequestDto = {
      estilo_id: createdEstiloId,
      name: faker.music.genre() + ' Letra',
      artist_id: createdArtistId,
      palo_id: createdPaloId,
      structure: 'AB',
      user_create_id: 1,
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
      expect(response.body.recording).to.be.null; // No recording expected
      createdLetraId = response.body.id;
    });
  });

  // ✅ 4. Update Letra **WITH** recording
  it('should update an existing Letra with a recording', () => {
    cy.readFile('cypress/fixtures/test.mp3', 'base64').then((mp3Base64) => {
      const updatedLetra: UpsertLetraRequestDto = {
        id: createdLetraId,
        estilo_id: createdEstiloId,
        name: faker.music.genre() + ' Letra Updated',
        artist_id: createdArtistId,
        palo_id: createdPaloId,
        structure: 'AB',
        user_update_id: 1,
        recording: mp3Base64,
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
        expect(response.body.recording).to.not.be.null; // Now we expect a recording
        expectTypeOf(response.body).toMatchTypeOf<UpsrtLetraResponseDto>();
      });
    });
  });

  // ✅ 5. Delete the Letra
  it('should delete a Letra', () => {
    cy.request({
      method: 'DELETE',
      url: `/letra/${createdLetraId}`,
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
