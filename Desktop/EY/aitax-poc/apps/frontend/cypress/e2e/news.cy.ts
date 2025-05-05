describe('News Page', () => {
  beforeEach(() => {
    // Mock the authentication by setting a token in localStorage
    localStorage.setItem('auth_token', 'fake-jwt-token');
    
    // Intercept the news API call
    cy.intercept('GET', '/api/news', {
      statusCode: 200,
      body: [
        {
          id: 1,
          title: 'New Tax Regulations for SMEs',
          content: 'The government has announced new tax regulations for small and medium enterprises.',
          published_date: '2025-04-01T10:00:00Z',
          source: 'Ministry of Finance',
        },
        {
          id: 2,
          title: 'VAT Changes Coming Next Month',
          content: 'Important VAT changes will be implemented starting next month.',
          published_date: '2025-04-15T14:30:00Z',
          source: 'Tax Authority',
        },
        {
          id: 3,
          title: 'Tax Deadline Extended',
          content: 'The deadline for filing annual tax returns has been extended by one month.',
          published_date: '2025-04-20T09:15:00Z',
          source: 'Tax Authority',
        },
      ],
    }).as('getNews');
    
    // Visit the news page
    cy.visit('/news');
    
    // Wait for the news API call to complete
    cy.wait('@getNews');
  });

  it('should display a list of news items', () => {
    // Check that the news page title is visible
    cy.contains('h1', 'Tax News').should('be.visible');
    
    // Check that all news items are displayed
    cy.get('[data-testid="news-item"]').should('have.length', 3);
    
    // Check that the first news item has the correct title
    cy.get('[data-testid="news-item"]').first().contains('New Tax Regulations for SMEs');
    
    // Check that the news items have dates
    cy.get('[data-testid="news-date"]').should('have.length', 3);
    
    // Check that the news items have sources
    cy.get('[data-testid="news-source"]').should('have.length', 3);
  });

  it('should navigate to news detail page when clicking on a news item', () => {
    // Intercept the news detail API call
    cy.intercept('GET', '/api/news/1', {
      statusCode: 200,
      body: {
        id: 1,
        title: 'New Tax Regulations for SMEs',
        content: 'The government has announced new tax regulations for small and medium enterprises.',
        published_date: '2025-04-01T10:00:00Z',
        source: 'Ministry of Finance',
        summary: 'This regulation will affect how SMEs report their income and expenses.',
      },
    }).as('getNewsDetail');
    
    // Click on the first news item
    cy.get('[data-testid="news-item"]').first().click();
    
    // Wait for the news detail API call to complete
    cy.wait('@getNewsDetail');
    
    // Check that we are on the news detail page
    cy.url().should('include', '/news/1');
    
    // Check that the news title is displayed
    cy.contains('New Tax Regulations for SMEs').should('be.visible');
    
    // Check that the news content is displayed
    cy.contains('The government has announced new tax regulations').should('be.visible');
    
    // Check that the personalized summary is displayed
    cy.contains('This regulation will affect how SMEs report').should('be.visible');
  });

  it('should allow adding notes to a news item', () => {
    // Intercept the news detail API call
    cy.intercept('GET', '/api/news/1', {
      statusCode: 200,
      body: {
        id: 1,
        title: 'New Tax Regulations for SMEs',
        content: 'The government has announced new tax regulations for small and medium enterprises.',
        published_date: '2025-04-01T10:00:00Z',
        source: 'Ministry of Finance',
        summary: 'This regulation will affect how SMEs report their income and expenses.',
        notes: [],
      },
    }).as('getNewsDetail');
    
    // Intercept the add note API call
    cy.intercept('POST', '/api/news/1/notes', {
      statusCode: 201,
      body: {
        id: 101,
        content: 'Need to check how this affects our company',
        created_at: '2025-05-05T12:00:00Z',
      },
    }).as('addNote');
    
    // Click on the first news item
    cy.get('[data-testid="news-item"]').first().click();
    
    // Wait for the news detail API call to complete
    cy.wait('@getNewsDetail');
    
    // Add a note
    cy.get('[data-testid="note-input"]').type('Need to check how this affects our company');
    cy.get('[data-testid="add-note-button"]').click();
    
    // Wait for the add note API call to complete
    cy.wait('@addNote');
    
    // Check that the note is displayed
    cy.contains('Need to check how this affects our company').should('be.visible');
  });
});
