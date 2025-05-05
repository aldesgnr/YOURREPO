describe('Login Page', () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit('/login');
  });

  it('should display login form', () => {
    // Check that the login form elements are visible
    cy.contains('h1', 'AI Tax Insights').should('be.visible');
    cy.contains('Login to your account').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible').and('contain', 'Login');
  });

  it('should show validation errors for empty fields', () => {
    // Submit the form without entering any data
    cy.get('button[type="submit"]').click();
    
    // Check that validation errors are shown
    cy.get('input[name="email"]').should('have.attr', 'aria-invalid', 'true');
    cy.get('input[name="password"]').should('have.attr', 'aria-invalid', 'true');
  });

  it('should successfully login with valid credentials', () => {
    // Intercept the login API call
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { access_token: 'fake-jwt-token' },
    }).as('loginRequest');

    // Fill in the login form with valid credentials
    cy.get('input[name="email"]').type('demo@example.com');
    cy.get('input[name="password"]').type('password123');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Wait for the login API call to complete
    cy.wait('@loginRequest');
    
    // Check that we are redirected to the profile page
    cy.url().should('include', '/profile');
  });

  it('should show error message for invalid credentials', () => {
    // Intercept the login API call and return an error
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { detail: 'Invalid email or password' },
    }).as('loginRequest');

    // Fill in the login form with invalid credentials
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Wait for the login API call to complete
    cy.wait('@loginRequest');
    
    // Check that an error message is displayed
    cy.contains('Invalid email or password').should('be.visible');
    
    // Check that we are still on the login page
    cy.url().should('include', '/login');
  });
});
