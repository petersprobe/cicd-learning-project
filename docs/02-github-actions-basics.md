# GitHub Actions Basics

## What is GitHub Actions?

GitHub Actions is a continuous integration and continuous deployment (CI/CD) platform that allows you to automate your build, test, and deployment pipeline directly in your GitHub repository.

## Key Concepts

### 1. Workflows
A workflow is a configurable automated process that will run one or more jobs. Workflows are defined by a YAML file in your repository.

### 2. Events
Events are specific activities that trigger a workflow. Examples:
- `push`: When code is pushed to a branch
- `pull_request`: When a pull request is created/updated
- `schedule`: On a time-based schedule
- `workflow_dispatch`: Manual trigger

### 3. Jobs
Jobs are a set of steps that execute on the same runner. Jobs can run in parallel or sequentially.

### 4. Steps
Steps are individual tasks that can run commands in a job. Steps are executed in order and are dependent on each other.

### 5. Actions
Actions are the smallest portable building block of a workflow. You can create your own actions or use actions from the GitHub Marketplace.

## Basic Workflow Structure

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Run tests
      run: npm test
      
    - name: Run linting
      run: npm run lint
```

## Creating Your First Workflow

Let's create a simple workflow for our Node.js application:

### Step 1: Create the Workflow File

Create a file at `.github/workflows/ci.yml` in your repository:

```yaml
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      
    - name: Run tests
      run: npm test
      
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      if: matrix.node-version == '18'
```

### Step 2: Add a Deployment Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to staging
      run: echo "Deploying to staging..."
      # Add your deployment commands here
      
    - name: Run integration tests
      run: npm run test:integration
      
    - name: Deploy to production
      run: echo "Deploying to production..."
      # Add your production deployment commands here
```

## Advanced Features

### 1. Environment Variables

```yaml
env:
  NODE_ENV: production
  DATABASE_URL: ${{ secrets.DATABASE_URL }}

jobs:
  deploy:
    environment: production
    runs-on: ubuntu-latest
    steps:
    - name: Deploy
      run: echo "Deploying with $NODE_ENV"
```

### 2. Conditional Steps

```yaml
steps:
- name: Run tests
  run: npm test
  
- name: Deploy to staging
  if: github.ref == 'refs/heads/develop'
  run: echo "Deploying to staging"
  
- name: Deploy to production
  if: github.ref == 'refs/heads/main'
  run: echo "Deploying to production"
```

### 3. Matrix Strategy

```yaml
jobs:
  test:
    strategy:
      matrix:
        node-version: [16, 18, 20]
        os: [ubuntu-latest, windows-latest]
    
    runs-on: ${{ matrix.os }}
    
    steps:
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
```

### 4. Caching

```yaml
steps:
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'  # Caches node_modules

- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

## Best Practices

### 1. Use Specific Action Versions
```yaml
# Good
uses: actions/checkout@v4

# Avoid
uses: actions/checkout@main
```

### 2. Optimize for Speed
```yaml
# Use caching
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

# Run jobs in parallel when possible
jobs:
  test:
    runs-on: ubuntu-latest
  lint:
    runs-on: ubuntu-latest
  security:
    runs-on: ubuntu-latest
```

### 3. Security
```yaml
# Use secrets for sensitive data
- name: Deploy
  env:
    API_KEY: ${{ secrets.API_KEY }}
  run: echo "Deploying with API key"
```

### 4. Error Handling
```yaml
steps:
- name: Run tests
  run: npm test
  continue-on-error: false  # Stop on failure

- name: Notify on failure
  if: failure()
  run: echo "Tests failed!"
```

## Common Workflow Patterns

### 1. Feature Branch Workflow
```yaml
on:
  pull_request:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - run: npm ci
    - run: npm test
    - run: npm run lint
```

### 2. Release Workflow
```yaml
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - run: npm ci
    - run: npm test
    - run: npm run build
    - name: Create Release
      uses: actions/create-release@v1
```

### 3. Scheduled Workflow
```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  maintenance:
    runs-on: ubuntu-latest
    steps:
    - name: Run maintenance tasks
      run: echo "Running daily maintenance"
```

## Exercise

1. **Create a basic CI workflow** for the sample application
2. **Add caching** to speed up builds
3. **Implement conditional deployment** based on branch
4. **Add security scanning** to your pipeline
5. **Set up notifications** for failed builds

## Next Steps

1. **Practice with the sample application** in this project
2. **Explore GitHub Actions Marketplace** for useful actions
3. **Learn about deployment strategies** (Blue-Green, Canary, etc.)
4. **Set up monitoring and alerting** for your pipelines

Ready to move on? Check out the next module: [Advanced CI/CD Concepts](../03-advanced-ci-cd-concepts.md)
