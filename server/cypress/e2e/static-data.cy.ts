// static-data.cy.ts

describe('Static Data API', () => {
  it('should return palos', () => {
    cy.request('GET', '/static-data/tableByType?type=palo').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('palo');
    });
  });
});

describe('Static Data API', () => {
  it('should return estilos', () => {
    cy.request('GET', '/static-data/tableByType?type=estilo').then(
      (response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('estilo');
      },
    );
  });
});

describe('Static Data API', () => {
  it('should return artists', () => {
    cy.request('GET', '/static-data/tableByType?type=artist').then(
      (response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('artist');
      },
    );
  });
});

describe('Static Data API', () => {
  it('should return compas', () => {
    cy.request('GET', '/static-data/tableByType?type=compas').then(
      (response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('compas');
      },
    );
  });
});

describe('Static Data API', () => {
  it('should return letras', () => {
    cy.request('GET', '/static-data/tableByType?type=letra').then(
      (response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('letra');
      },
    );
  });
});

describe('Static Data API', () => {
  it('should return letras_artist', () => {
    cy.request('GET', '/static-data/tableByType?type=letra_artist').then(
      (response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('letra_artist');
      },
    );
  });
});
