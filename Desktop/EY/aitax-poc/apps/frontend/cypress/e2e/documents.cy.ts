describe('Documents Page', () => {
  beforeEach(() => {
    // Mock the authentication by setting a token in localStorage
    localStorage.setItem('auth_token', 'fake-jwt-token');
    
    // Intercept the documents API call
    cy.intercept('GET', '/api/documents', {
      statusCode: 200,
      body: [
        {
          id: 1,
          filename: 'tax_report_2024.pdf',
          content_type: 'application/pdf',
          size: 1024000,
          upload_date: '2025-04-10T15:30:00Z',
        },
        {
          id: 2,
          filename: 'invoice_q1_2025.pdf',
          content_type: 'application/pdf',
          size: 512000,
          upload_date: '2025-04-15T09:45:00Z',
        },
      ],
    }).as('getDocuments');
    
    // Visit the documents page
    cy.visit('/documents');
    
    // Wait for the documents API call to complete
    cy.wait('@getDocuments');
  });

  it('should display a list of documents', () => {
    // Check that the documents page title is visible
    cy.contains('h1', 'Documents').should('be.visible');
    
    // Check that all documents are displayed
    cy.get('[data-testid="document-item"]').should('have.length', 2);
    
    // Check that the first document has the correct filename
    cy.get('[data-testid="document-item"]').first().contains('tax_report_2024.pdf');
    
    // Check that the documents have upload dates
    cy.get('[data-testid="document-date"]').should('have.length', 2);
    
    // Check that the documents have file sizes
    cy.get('[data-testid="document-size"]').should('have.length', 2);
  });

  it('should open document upload dialog when clicking upload button', () => {
    // Click on the upload button
    cy.get('[data-testid="upload-button"]').click();
    
    // Check that the upload dialog is displayed
    cy.get('[data-testid="upload-dialog"]').should('be.visible');
    
    // Check that the file input is available
    cy.get('input[type="file"]').should('exist');
    
    // Check that the upload and cancel buttons are available
    cy.get('[data-testid="upload-submit-button"]').should('be.visible');
    cy.get('[data-testid="upload-cancel-button"]').should('be.visible');
  });

  it('should navigate to document detail page when clicking on a document', () => {
    // Intercept the document detail API call
    cy.intercept('GET', '/api/documents/1', {
      statusCode: 200,
      body: {
        id: 1,
        filename: 'tax_report_2024.pdf',
        content_type: 'application/pdf',
        size: 1024000,
        upload_date: '2025-04-10T15:30:00Z',
        content_preview: 'This is a tax report for the year 2024...',
      },
    }).as('getDocumentDetail');
    
    // Intercept the document chat history API call
    cy.intercept('GET', '/api/documents/1/chat', {
      statusCode: 200,
      body: [],
    }).as('getDocumentChat');
    
    // Click on the first document
    cy.get('[data-testid="document-item"]').first().click();
    
    // Wait for the API calls to complete
    cy.wait('@getDocumentDetail');
    cy.wait('@getDocumentChat');
    
    // Check that we are on the document detail page
    cy.url().should('include', '/documents/1');
    
    // Check that the document title is displayed
    cy.contains('tax_report_2024.pdf').should('be.visible');
    
    // Check that the document preview is displayed
    cy.contains('This is a tax report for the year 2024').should('be.visible');
    
    // Check that the chat interface is displayed
    cy.get('[data-testid="chat-input"]').should('be.visible');
    cy.get('[data-testid="send-message-button"]').should('be.visible');
  });

  it('should allow asking questions about a document', () => {
    // Intercept the document detail API call
    cy.intercept('GET', '/api/documents/1', {
      statusCode: 200,
      body: {
        id: 1,
        filename: 'tax_report_2024.pdf',
        content_type: 'application/pdf',
        size: 1024000,
        upload_date: '2025-04-10T15:30:00Z',
        content_preview: 'This is a tax report for the year 2024...',
      },
    }).as('getDocumentDetail');
    
    // Intercept the document chat history API call
    cy.intercept('GET', '/api/documents/1/chat', {
      statusCode: 200,
      body: [],
    }).as('getDocumentChat');
    
    // Visit the document detail page
    cy.visit('/documents/1');
    
    // Wait for the API calls to complete
    cy.wait('@getDocumentDetail');
    cy.wait('@getDocumentChat');
    
    // Intercept the send message API call
    cy.intercept('POST', '/api/documents/1/chat', {
      statusCode: 201,
      body: {
        id: 101,
        question: 'What is the total tax amount for 2024?',
        answer: 'The total tax amount for 2024 is $15,750.',
        created_at: '2025-05-05T12:00:00Z',
      },
    }).as('sendMessage');
    
    // Type a question and send it
    cy.get('[data-testid="chat-input"]').type('What is the total tax amount for 2024?');
    cy.get('[data-testid="send-message-button"]').click();
    
    // Wait for the send message API call to complete
    cy.wait('@sendMessage');
    
    // Check that the question is displayed in the chat
    cy.contains('What is the total tax amount for 2024?').should('be.visible');
    
    // Check that the answer is displayed in the chat
    cy.contains('The total tax amount for 2024 is $15,750.').should('be.visible');
  });

  it('should allow adding notes to document chat answers', () => {
    // Intercept the document detail API call
    cy.intercept('GET', '/api/documents/1', {
      statusCode: 200,
      body: {
        id: 1,
        filename: 'tax_report_2024.pdf',
        content_type: 'application/pdf',
        size: 1024000,
        upload_date: '2025-04-10T15:30:00Z',
        content_preview: 'This is a tax report for the year 2024...',
      },
    }).as('getDocumentDetail');
    
    // Intercept the document chat history API call with existing messages
    cy.intercept('GET', '/api/documents/1/chat', {
      statusCode: 200,
      body: [
        {
          id: 101,
          question: 'What is the total tax amount for 2024?',
          answer: 'The total tax amount for 2024 is $15,750.',
          created_at: '2025-05-05T12:00:00Z',
          notes: [],
        },
      ],
    }).as('getDocumentChat');
    
    // Visit the document detail page
    cy.visit('/documents/1');
    
    // Wait for the API calls to complete
    cy.wait('@getDocumentDetail');
    cy.wait('@getDocumentChat');
    
    // Intercept the add note API call
    cy.intercept('POST', '/api/documents/1/chat/101/notes', {
      statusCode: 201,
      body: {
        id: 201,
        content: 'Need to verify this amount with accounting',
        created_at: '2025-05-05T12:05:00Z',
      },
    }).as('addNote');
    
    // Click on the add note button for the answer
    cy.get('[data-testid="add-note-button"]').click();
    
    // Type a note and save it
    cy.get('[data-testid="note-input"]').type('Need to verify this amount with accounting');
    cy.get('[data-testid="save-note-button"]').click();
    
    // Wait for the add note API call to complete
    cy.wait('@addNote');
    
    // Check that the note is displayed
    cy.contains('Need to verify this amount with accounting').should('be.visible');
  });
});
