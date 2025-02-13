// feedback.cy.ts

describe('Feedback API', () => {
  it('should create a feedback', () => {
    cy.request('POST', '/feedback', {
      comment: 'Test feedback',
      email: 'test@example.com',
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property(
        'message',
        'Feedback created successfully',
      );
    });
  });
});
