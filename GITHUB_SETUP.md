# GitHub Setup Instructions

This file contains instructions for syncing your local repository to GitHub.

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the **+** icon in the top right and select **New repository**
3. Set the repository details:
   - **Repository name:** `nodejs-example` (or your preferred name)
   - **Description:** Node.js example with Express API, Nuxt frontend, and dual database support
   - **Visibility:** Choose Public or Private
   - **⚠️ DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **Create repository**

## Step 2: Add Remote and Push

After creating the repository on GitHub, run these commands in your terminal:

```bash
# Navigate to your project directory
cd /Users/alexanderleitch/Antigravity/nodejs-example

# Add the GitHub repository as a remote
# Replace <USERNAME> and <REPOSITORY> with your actual GitHub username and repo name
git remote add origin https://github.com/<USERNAME>/<REPOSITORY>.git

# Verify the remote was added
git remote -v

# Push your code to GitHub
git push -u origin main

# If your default branch is 'master' instead of 'main', use:
# git branch -M main  # Rename to main first
# git push -u origin main
```

## Step 3: Verify on GitHub

1. Go to your repository page on GitHub
2. You should see all your files, including:
   - README.md
   - ARCHITECTURE.md
   - docker-compose.yml
   - api/ directory
   - frontend/ directory
   - database/ directory

## Alternative: Using SSH

If you prefer SSH over HTTPS:

```bash
# Add remote using SSH
git remote add origin git@github.com:<USERNAME>/<REPOSITORY>.git

# Push to GitHub
git push -u origin main
```

## Future Commits

After the initial setup, making changes is simple:

```bash
# Make your changes to files...

# Stage the changes
git add .

# Or stage specific files
git add path/to/file

# Commit with a descriptive message
git commit -m "Your commit message here"

# Push to GitHub
git push
```

## Commit Message Best Practices

Good commit messages help understand the project history:

- **Use present tense:** "Add feature" not "Added feature"
- **Be descriptive:** Explain what AND why, not just what
- **Keep first line under 50 characters** for the summary
- **Add detailed description** after a blank line if needed

**Examples:**

```bash
# Good
git commit -m "Add user authentication with JWT tokens"

# Also good with details
git commit -m "Add pagination to task list API

- Implement limit and offset query parameters
- Add total count to response metadata
- Update documentation with pagination examples"

# Not ideal
git commit -m "Updates"
git commit -m "Fixed stuff"
```

## Repository Settings

### Recommended GitHub Settings:

1. **Enable Branch Protection** (for main branch):
   - Settings → Branches → Add rule
   - Require pull request reviews before merging
   - Require status checks to pass before merging

2. **Add Topics** for discoverability:
   - Settings → General → Topics
   - Suggested: `nodejs`, `express`, `nuxt`, `mysql`, `postgresql`, `docker`, `learning`

3. **Edit Repository Description:**
   - Add the description and website URL

4. **Create Labels** for issues (optional):
   - `bug`, `enhancement`, `documentation`, `good-first-issue`

## Troubleshooting

### Authentication Issues

If you get authentication errors:

**Option 1: Personal Access Token**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` scope
3. Use the token as your password when pushing

**Option 2: SSH Keys**
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add to GitHub: Settings → SSH and GPG keys → New SSH key
3. Paste the contents of `~/.ssh/id_ed25519.pub`

### Remote Already Exists

If you get "remote origin already exists":

```bash
# Remove the existing remote
git remote remove origin

# Add it again with correct URL
git remote add origin https://github.com/<USERNAME>/<REPOSITORY>.git
```

### Branch Name Mismatch

If GitHub expects `master` but you have `main`:

```bash
# Rename your branch to main
git branch -M main

# Push to main
git push -u origin main
```

---

**Your repository has been initialized locally and is ready to push to GitHub!**

Current status:
- ✅ Git repository initialized
- ✅ Initial commit created with all project files
- ⏳ Waiting for you to create GitHub repository and add remote
