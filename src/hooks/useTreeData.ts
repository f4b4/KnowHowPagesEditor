import { useState, useEffect } from 'react';

export interface ApiTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: ApiTreeNode[];
}

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  isExpanded?: boolean;
  path: string;
  type: 'file' | 'directory';
}

interface TreeApiResponse {
  tree: ApiTreeNode;
}

/**
 * Custom hook to fetch and manage tree data from the API
 */
export const useTreeData = () => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Converts API tree structure to frontend tree structure
   */
  const convertApiNodeToTreeNode = (apiNode: ApiTreeNode, parentPath = ''): TreeNode => {
    const id = parentPath ? `${parentPath}/${apiNode.name}` : apiNode.name;
    
    return {
      id,
      label: apiNode.name,
      path: apiNode.path,
      type: apiNode.type,
      isExpanded: apiNode.type === 'directory' ? false : undefined,
      children: apiNode.children?.map(child => 
        convertApiNodeToTreeNode(child, id)
      )
    };
  };

  /**
   * Fetches tree data from the API
   */
  const fetchTreeData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/knowhow-api/tree');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: TreeApiResponse = await response.json();
      
      // Convert the root tree node to frontend format
      // Since the API returns a single root node, we need to use its children
      const rootNode = convertApiNodeToTreeNode(data.tree);
      
      // Use the children of the root content directory as our tree data
      setTreeData(rootNode.children || []);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tree data';
      setError(errorMessage);
      console.error('Error fetching tree data:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refreshes the tree data
   */
  const refreshTree = () => {
    fetchTreeData();
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchTreeData();
  }, []);

  return {
    treeData,
    loading,
    error,
    refreshTree
  };
};
