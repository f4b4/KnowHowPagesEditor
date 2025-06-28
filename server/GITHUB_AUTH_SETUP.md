# GitHub Authentication Setup

To enable automatic git commits and pushes from the KnowHowPagesEditor, you need to configure GitHub authentication.

## Method 1: Personal Access Token (Recommended)

1. **Create a Personal Access Token**:

### Generate fine-grained personal access token
To create a **fine-grained personal access token** on GitHub with `repo` and `workflow` permissions:

1. **Go to** [GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/personal-access-tokens)
2. Click **"Generate new token"**.
3. **Name your token** and set an expiration date.
4. **Resource owner:**  
   - Choose your user or an organization.
5. **Repository access:**  
   - Select "All repositories" or choose specific repositories.
6. **Repository permissions:**  
   - Under **Repository permissions**, set:
     - **Actions** → `Read and write`
     - **Contents** → `Read and write` (for full repo access)
     - (Optionally, set other permissions as needed)
7. **Account permissions:**  
   - Set any additional permissions if required.
8. Click **"Generate token"** at the bottom.

> **Note:**  
> Fine-grained tokens use specific permissions like **Actions** (for workflows) and **Contents** (for repo access) instead of the old `repo`/`workflow` scopes.

2. **Configure Environment Variables**:
   - Copy the `.env.example` file to `.env` in the server directory:
     ```powershell
     cd server
     Copy-Item .env.example .env
     ```
   - Edit the `.env` file and replace the placeholders:
     ```
     GITHUB_USERNAME=your-actual-github-username
     GITHUB_TOKEN=ghp_your_actual_token_here
     ```

3. **Restart the server**:
   ```powershell
   npm run dev
   ```

## Method 2: SSH Keys (Alternative)

If you prefer to use SSH keys instead of tokens:

1. **Generate SSH Key** (if you don't have one):
   ```powershell
   ssh-keygen -t ed25519 -C "your-email@example.com"
   ```

2. **Add SSH Key to GitHub**:
   - Copy your public key: `Get-Content ~/.ssh/id_ed25519.pub`
   - Go to GitHub Settings → SSH and GPG keys
   - Add the public key

3. **Configure Repository Remote**:
   ```bash
   cd ../../KnowHowPages
   git remote set-url origin git@github.com:username/KnowHowPages.git
   ```

## Method 3: Git Credential Manager (Windows)

For Windows users, you can also use Git Credential Manager:

1. **Install Git Credential Manager** (usually comes with Git for Windows)
2. **Configure it**:
   ```powershell
   git config --global credential.helper manager
   ```
3. **Test authentication**:
   ```bash
   cd ../../KnowHowPages
   git push
   ```
   - A browser window will open for GitHub authentication
   - Credentials will be stored securely

## Troubleshooting

- **Token expired**: Generate a new token and update the `.env` file
- **Permission denied**: Ensure your token has the `repo` scope
- **Remote not configured**: Check that the KnowHowPages repository has a GitHub remote configured
- **Branch protection**: If the main branch has protection rules, you may need additional permissions

## Security Notes

- Never commit the `.env` file to version control
- Use environment-specific tokens (separate tokens for development/production)
- Regularly rotate your tokens for security
- Consider using GitHub Apps for more granular permissions in production environments
