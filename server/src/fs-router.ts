import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { join, relative, extname, basename } from 'path';
import simpleGit from 'simple-git';

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
}

export interface FileItem {
  name: string;
  path: string;
  relativePath: string;
}

/**
 * Content directory relative to the KnowHowPages repository
 */
const CONTENT_BASE_PATH = join(process.cwd(), '..', '..', 'KnowHowPages', 'content');

/**
 * KnowHowPages repository root directory
 */
const REPO_BASE_PATH = join(process.cwd(), '..', '..', 'KnowHowPages');

/**
 * GitHub configuration from environment variables
 */
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

/**
 * Recursively builds a tree structure mirroring the directory layout.
 * Similar to the Python build_tree function in generate.py
 */
export async function buildContentTree(rootPath: string = CONTENT_BASE_PATH): Promise<TreeNode> {
  const stats = await stat(rootPath);
  const name = basename(rootPath);
  
  if (!stats.isDirectory()) {
    return {
      name,
      path: getRelativePath(rootPath),
      type: 'file'
    };
  }

  const node: TreeNode = {
    name,
    path: getRelativePath(rootPath),
    type: 'directory',
    children: []
  };
  try {
    const entries = await readdir(rootPath);
    
    // Get stat info for all entries first
    const entriesWithStats = await Promise.all(
      entries.map(async (entry) => ({
        name: entry,
        path: join(rootPath, entry),
        isDirectory: (await stat(join(rootPath, entry))).isDirectory()
      }))
    );
    
    // Sort entries: directories first, then files, both alphabetically
    const sortedEntries = entriesWithStats.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });    // Process entries sequentially to maintain sort order
    for (const entry of sortedEntries) {
      const entryPath = entry.path;
      
      if (entry.isDirectory) {
        const childNode = await buildContentTree(entryPath);
        node.children!.push(childNode);
      } else if (extname(entry.name).toLowerCase() === '.md') {
        const fileNode: TreeNode = {
          name: basename(entry.name, '.md'),
          path: getRelativePath(entryPath),
          type: 'file'
        };
        node.children!.push(fileNode);
      }
    }

    // Sort children properly after async operations
    node.children!.sort((a, b) => {
      if (a.type === 'directory' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'directory') return 1;
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });

  } catch (error) {
    console.error(`Error reading directory ${rootPath}:`, error);
  }

  return node;
}

/**
 * Gets the relative path from content base to a file
 */
export function getRelativePath(filePath: string): string {
  return relative(CONTENT_BASE_PATH, filePath);
}

/**
 * Resolves a relative path to absolute path within content directory
 */
export function resolveContentPath(relativePath: string): string {
  return join(CONTENT_BASE_PATH, relativePath);
}

/**
 * Reads a markdown file and returns its content
 */
export async function readMarkdownFile(relativePath: string): Promise<string> {
  const fullPath = resolveContentPath(relativePath);
  
  // Ensure the file is within content directory for security
  if (!fullPath.startsWith(CONTENT_BASE_PATH)) {
    throw new Error('Access denied: Path outside content directory');
  }

  if (!fullPath.endsWith('.md')) {
    throw new Error('Only markdown files are supported');
  }

  try {
    return await readFile(fullPath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Writes content to a markdown file
 */
export async function writeMarkdownFile(relativePath: string, content: string): Promise<void> {
  const fullPath = resolveContentPath(relativePath);
  
  // Ensure the file is within content directory for security
  if (!fullPath.startsWith(CONTENT_BASE_PATH)) {
    throw new Error('Access denied: Path outside content directory');
  }

  if (!fullPath.endsWith('.md')) {
    throw new Error('Only markdown files are supported');
  }

  try {
    await writeFile(fullPath, content, 'utf-8');
    
    // After successfully writing the file, commit and push to git
    const relativeRepoPath = relative(REPO_BASE_PATH, fullPath);
    await commitAndPushChanges(relativeRepoPath);
  } catch (error) {
    throw new Error(`Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Converts tree structure to a flat list of file items for easier frontend consumption
 */
export function flattenTree(node: TreeNode, basePath: string = CONTENT_BASE_PATH): FileItem[] {
  const items: FileItem[] = [];
  
  if (node.type === 'file') {
    items.push({
      name: node.name,
      path: node.path,
      relativePath: getRelativePath(node.path)
    });
  }
  
  if (node.children) {
    for (const child of node.children) {
      items.push(...flattenTree(child, basePath));
    }
  }
  
  return items;
}

/**
 * Commits and pushes changes to the git repository
 */
/**
 * Commits and pushes changes to the git repository
 */
async function commitAndPushChanges(filePath: string): Promise<void> {
  const git = simpleGit(REPO_BASE_PATH);
  
  try {
    // Check if we're in a git repository
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      throw new Error('Directory is not a git repository');
    }

    // Configure Git user if not already set
    await configureGitUser(git);
    
    // Add the specific file to staging
    await git.add(filePath);
    
    // Check if there are any changes to commit
    const status = await git.status();
    if (status.files.length === 0) {
      console.log('No changes to commit');
      return;
    }
    
    // Commit the changes with a descriptive message
    const fileName = basename(filePath);
    const commitMessage = `Update ${fileName} via KnowHowPagesEditor`;
    await git.commit(commitMessage);
    
    // Check if remote exists before pushing
    const remotes = await git.getRemotes(true);
    if (remotes.length === 0) {
      console.log('No remote repository configured, skipping push');
      return;
    }

    // Configure remote URL with authentication if token is available
    await configureRemoteAuth(git);
    
    // Push to the remote repository
    await git.push();
    
    console.log(`Successfully committed and pushed changes for ${fileName}`);
  } catch (error) {
    console.error('Git operation failed:', error);
    throw new Error(`Failed to commit and push changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Configures Git user information
 */
async function configureGitUser(git: any): Promise<void> {
  try {
    // Check if user.name is already configured
    const userName = await git.getConfig('user.name').catch(() => null);
    const userEmail = await git.getConfig('user.email').catch(() => null);
    
    if (!userName && GITHUB_USERNAME) {
      await git.addConfig('user.name', GITHUB_USERNAME);
      console.log(`Set git user.name to ${GITHUB_USERNAME}`);
    }
    
    if (!userEmail && GITHUB_USERNAME) {
      // Use GitHub's noreply email format
      const email = `${GITHUB_USERNAME}@users.noreply.github.com`;
      await git.addConfig('user.email', email);
      console.log(`Set git user.email to ${email}`);
    }
  } catch (error) {
    console.warn('Failed to configure git user:', error);
  }
}

/**
 * Configures remote URL with authentication token
 */
async function configureRemoteAuth(git: any): Promise<void> {
  if (!GITHUB_TOKEN || !GITHUB_USERNAME) {
    console.log('GitHub token or username not configured, using existing remote configuration');
    return;
  }

  try {
    const remotes = await git.getRemotes(true);
    const origin = remotes.find((remote: any) => remote.name === 'origin');
    
    if (origin && origin.refs.push) {
      const pushUrl = origin.refs.push;
      
      // Check if it's a GitHub HTTPS URL
      if (pushUrl.includes('github.com') && pushUrl.startsWith('https://')) {
        // Extract repository path from URL
        const repoMatch = pushUrl.match(/github\.com\/(.+)\.git$/);
        if (repoMatch) {
          const repoPath = repoMatch[1];
          const authenticatedUrl = `https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${repoPath}.git`;
          
          // Set the authenticated URL for pushing
          await git.remote(['set-url', 'origin', authenticatedUrl]);
          console.log('Configured remote origin with authentication token');
        }
      }
    }
  } catch (error) {
    console.warn('Failed to configure remote authentication:', error);
  }
}
