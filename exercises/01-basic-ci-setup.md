# Exercise 1: Basic CI Setup

## Objective
Set up your first Continuous Integration pipeline using GitHub Actions for the sample application.

## Prerequisites
- Git installed on your machine
- GitHub account
- Basic understanding of Node.js

## Steps

### Step 1: Initialize Git Repository

1. Navigate to your project directory:
   ```bash
   cd cicd
   ```

2. Initialize a Git repository:
   ```bash
   git init
   ```

3. Add all files to Git:
   ```bash
   git add .
   ```

4. Make your first commit:
   ```bash
   git commit -m "Initial commit: CI/CD learning project"
   ```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `cicd-learning-project`
3. Make it public (for easier sharing)
4. Don't initialize with README (we already have one)

### Step 3: Push to GitHub

1. Add your GitHub repository as remote:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/cicd-learning-project.git
   ```

2. Push your code:
   ```bash
   git push -u origin main
   ```

### Step 4: Set Up GitHub Actions

1. Create the `.github/workflows` directory:
   ```bash
   mkdir -p .github/workflows
   ```

2. Copy the CI pipeline configuration:
   ```bash
   cp pipelines/github-actions-ci.yml .github/workflows/ci.yml
   ```

3. Commit and push the workflow:
   ```bash
   git add .github/workflows/ci.yml
   git commit -m "Add CI pipeline"
   git push
   ```

### Step 5: Test Your Pipeline

1. Go to your GitHub repository
2. Click on the "Actions" tab
3. You should see your workflow running
4. Monitor the build process

## Expected Results

✅ **Success Criteria:**
- Repository is created on GitHub
- CI pipeline is configured
- Pipeline runs successfully on push
- All tests pass
- No linting errors

## Troubleshooting

### Common Issues:

1. **Workflow not triggering:**
   - Check that the workflow file is in `.github/workflows/`
   - Verify the YAML syntax is correct
   - Ensure you're pushing to the correct branch

2. **Tests failing:**
   - Check the test output in GitHub Actions
   - Verify all dependencies are installed
   - Ensure test files are in the correct location

3. **Linting errors:**
   - Install ESLint: `npm install -g eslint`
   - Run locally: `npm run lint`
   - Fix any issues before pushing

## Next Steps

After completing this exercise:

1. **Add more tests** to the application
2. **Implement code coverage** reporting
3. **Add security scanning** to the pipeline
4. **Set up branch protection** rules

## Bonus Challenge

Try these additional tasks:

1. **Add caching** to speed up builds
2. **Implement parallel jobs** for different Node.js versions
3. **Add status badges** to your README
4. **Set up notifications** for failed builds

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Node.js GitHub Actions](https://github.com/actions/setup-node)
- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring)

---

**Ready for the next exercise?** Check out [Exercise 2: Advanced CI/CD Features](../02-advanced-cicd-features.md)
