import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { join, relative, extname, basename } from 'path';

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
