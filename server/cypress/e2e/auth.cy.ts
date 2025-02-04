import { LoginRequestDto, LoginResponseDto } from '@common/dto/login.dto';

describe('Admin Authentication', () => {
  const adminCredentials = {
    email: 'amit217@yandex.com', // Set your actual admin email
    password: '21780Amit', // Set your actual admin password
  };

  let authToken: string;

  // ✅ Test Login
  it('should allow admin to log in via API', () => {
    const loginRequest: LoginRequestDto = {
      email: adminCredentials.email,
      password: adminCredentials.password,
    };

    cy.request<LoginResponseDto>({
      method: 'POST',
      url: '/auth/login',
      body: loginRequest,
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(200); // Expect 200 OK
      expect(response.body).to.have.property('token'); // Expect token in response
      authToken = response.body.token; // Save token for later use
    });
  });

  // ✅ Test Invalid Login Attempt
  it('should not allow admin to log in with incorrect credentials', () => {
    const invalidLoginRequest: LoginRequestDto = {
      email: adminCredentials.email,
      password: 'WrongPassword123!',
    };

    cy.request<LoginResponseDto>({
      method: 'POST',
      url: '/auth/login',
      body: invalidLoginRequest,
      failOnStatusCode: false, // Allow 4xx responses
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(401); // Expect 401 Unauthorized
    });
  });
});
