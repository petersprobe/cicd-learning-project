# 🚀 Quick Start Guide

Welcome to your CI/CD learning journey! This guide will get you up and running in 30 minutes.

## ⚡ What You'll Learn

By the end of this quick start, you'll have:
- ✅ A working CI/CD pipeline
- ✅ Automated testing
- ✅ Code quality checks
- ✅ A foundation for advanced CI/CD concepts

## 🎯 Step-by-Step Guide

### Step 1: Set Up Your Environment (5 minutes)

1. **Install Node.js** (if not already installed):
   ```bash
   # Download from https://nodejs.org/
   # Or use a package manager
   ```

2. **Install Git** (if not already installed):
   ```bash
   # Download from https://git-scm.com/
   ```

3. **Create a GitHub account** (if you don't have one):
   - Go to [GitHub](https://github.com)
   - Sign up for a free account

### Step 2: Test the Sample Application (5 minutes)

1. **Navigate to the app directory**:
   ```bash
   cd app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the application**:
   ```bash
   npm start
   ```

4. **Test the application**:
   ```bash
   npm test
   ```

5. **Check code quality**:
   ```bash
   npm run lint
   ```

### Step 3: Set Up Git Repository (10 minutes)

1. **Initialize Git** (from the project root):
   ```bash
   cd ..
   git init
   git add .
   git commit -m "Initial commit: CI/CD learning project"
   ```

2. **Create GitHub repository**:
   - Go to GitHub and create a new repository
   - Name it `cicd-learning-project`
   - Make it public

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/cicd-learning-project.git
   git push -u origin main
   ```

### Step 4: Set Up CI/CD Pipeline (10 minutes)

1. **Create GitHub Actions workflow**:
   ```bash
   mkdir -p .github/workflows
   cp pipelines/github-actions-ci.yml .github/workflows/ci.yml
   ```

2. **Commit and push the pipeline**:
   ```bash
   git add .github/workflows/ci.yml
   git commit -m "Add CI pipeline"
   git push
   ```

3. **Monitor your pipeline**:
   - Go to your GitHub repository
   - Click the "Actions" tab
   - Watch your pipeline run!

## 🎉 Congratulations!

You now have a working CI/CD pipeline! Here's what happens when you push code:

1. **Automated Testing**: Your code is automatically tested
2. **Code Quality**: Linting checks ensure code quality
3. **Security**: Security scans check for vulnerabilities
4. **Build**: Your application is built and packaged

## 📚 What's Next?

### Immediate Next Steps (This Week)

1. **Read the fundamentals**:
   - [CI/CD Fundamentals](docs/01-ci-cd-fundamentals.md)

2. **Complete your first exercise**:
   - [Exercise 1: Basic CI Setup](exercises/01-basic-ci-setup.md)

3. **Explore GitHub Actions**:
   - [GitHub Actions Basics](docs/02-github-actions-basics.md)

### This Month

1. **Follow the learning path**:
   - [Complete Learning Path](docs/learning-path.md)

2. **Practice with the sample app**:
   - Add new features
   - Write more tests
   - Improve code quality

3. **Set up deployment**:
   - Deploy to staging
   - Deploy to production
   - Add monitoring

## 🔧 Troubleshooting

### Common Issues

**Pipeline not running?**
- Check that the workflow file is in `.github/workflows/`
- Verify YAML syntax is correct
- Ensure you're pushing to the correct branch

**Tests failing?**
- Run tests locally first: `npm test`
- Check the test output in GitHub Actions
- Verify all dependencies are installed

**Linting errors?**
- Run locally: `npm run lint`
- Fix any issues before pushing
- Check the ESLint configuration

### Getting Help

1. **Check the documentation** in the `docs/` folder
2. **Review the exercises** in the `exercises/` folder
3. **Search GitHub Actions documentation**
4. **Ask questions in the GitHub community**

## 🎯 Success Checklist

- [ ] Sample application runs locally
- [ ] All tests pass
- [ ] No linting errors
- [ ] Git repository is set up
- [ ] GitHub repository is created
- [ ] CI pipeline is configured
- [ ] Pipeline runs successfully
- [ ] You understand the basic concepts

## 🚀 Advanced Features to Try

Once you're comfortable with the basics:

1. **Add caching** to speed up builds
2. **Implement parallel jobs** for different Node.js versions
3. **Add code coverage** reporting
4. **Set up branch protection** rules
5. **Add security scanning**
6. **Implement deployment** to staging/production

## 📞 Need Help?

- **Documentation**: Check the `docs/` folder
- **Exercises**: Follow the step-by-step guides in `exercises/`
- **Sample Code**: Review the application in `app/`
- **Pipelines**: Study the configurations in `pipelines/`

---

**Remember**: CI/CD is a skill that improves with practice. Start small, learn incrementally, and build up to more complex pipelines!

Happy coding! 🎉
