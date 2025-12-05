# Unit Testing Guide

This project includes comprehensive unit tests for the backend API.

## Test Framework

- **Jest** - JavaScript testing framework
- **Supertest** - HTTP assertions for Express routes

## Running Tests

```bash
# Run all tests
cd api
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### Configuration Tests
- `tests/test_mysql_config.js` - MySQL connection pool and configuration
- `tests/test_postgresql_config.js` - PostgreSQL connection pool and configuration

### Route Tests
- `tests/test_mysql_routes.js` - MySQL CRUD endpoints
- `tests/test_postgresql_routes.js` - PostgreSQL CRUD endpoints

## Test Coverage

Tests cover:
- ✅ Database connection establishment
- ✅ Connection pool configuration
- ✅ All CRUD operations (Create, Read, Update, Delete)
- ✅ Input validation
- ✅ Error handling
- ✅ HTTP status codes
- ✅ Response formats
- ✅ Database-specific features (RETURNING clause, parameterized queries)

## Writing New Tests

Follow these patterns:

### 1. Unit Test for Functions

```javascript
describe('functionName', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionName(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### 2. Integration Test for Routes

```javascript
describe('GET /api/endpoint', () => {
  it('should return 200 and data', async () => {
    const response = await request(app).get('/api/endpoint');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });
});
```

## Mocking

Database connections are mocked to:
- Run tests without a database
- Speed up test execution
- Ensure consistent test results
- Test error scenarios

## CI/CD Integration

Tests are automatically run by GitHub Actions on every push and pull request.

## Best Practices

1. **Arrange-Act-Assert** pattern
2. **Test one thing per test**
3. **Use descriptive test names**
4. **Mock external dependencies**
5. **Clean up after tests**
6. **Test both success and failure cases**

## Troubleshooting

**Tests not running:**
- Ensure you're in the `api` directory
- Run `npm install` to install test dependencies

**Mocks not working:**
- Check that `jest.mock()` is called before imports
- Verify mock paths are correct

**Timeout errors:**
- Increase timeout in `tests/setup.js`
- Check for async operations without proper await

## Coverage Reports

After running `npm run test:coverage`, view the report:

```bash
open coverage/lcov-report/index.html
```

Target: >80% code coverage for production readiness.
