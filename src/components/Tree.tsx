import { useState } from 'react';
import './Tree.css';

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  isExpanded?: boolean;
}

interface TreeProps {
  data: TreeNode[];
  onNodeSelect?: (node: TreeNode) => void;
}

interface TreeItemProps {
  node: TreeNode;
  onNodeSelect?: (node: TreeNode) => void;
  onToggle: (nodeId: string) => void;
  level: number;
}

const TreeItem = ({ node, onNodeSelect, onToggle, level }: TreeItemProps) => {
  const hasChildren = node.children && node.children.length > 0;
  
  const handleToggle = () => {
    if (hasChildren) {
      onToggle(node.id);
    }
  };

  const handleSelect = () => {
    onNodeSelect?.(node);
  };

  return (
    <div className="tree-item">
      <div 
        className="tree-item-content" 
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={handleSelect}
      >
        {hasChildren && (
          <button
            className="tree-toggle"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
          >
            {node.isExpanded ? '▼' : '▶'}
          </button>
        )}
        {!hasChildren && <span className="tree-spacer"></span>}
        <span className="tree-label">{node.label}</span>
      </div>
      {hasChildren && node.isExpanded && (
        <div className="tree-children">
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              onNodeSelect={onNodeSelect}
              onToggle={onToggle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Tree = ({ data, onNodeSelect }: TreeProps) => {
  const [treeData, setTreeData] = useState<TreeNode[]>(data);

  const handleToggle = (nodeId: string) => {
    const toggleNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return { ...node, children: toggleNode(node.children) };
        }
        return node;
      });
    };

    setTreeData(toggleNode(treeData));
  };

  return (
    <div className="tree-container">
      <h3 className="tree-title">Navigation</h3>
      <div className="tree">
        {treeData.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            onNodeSelect={onNodeSelect}
            onToggle={handleToggle}
            level={0}
          />
        ))}
      </div>
    </div>
  );
};

export default Tree;
