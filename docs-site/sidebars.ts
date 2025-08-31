import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'overview',
    {
      type: 'category',
      label: 'Installation',
      items: [
        'installation/quick-start',
        'installation/installation',
      ],
    },
    {
      type: 'category', 
      label: 'Guides',
      items: [
        'guides/basic-commands',
        'guides/first-repository',
        'guides/branching-strategies',
        'guides/team-collaboration',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/ai-workflow',
        'features/ai-features',
        'features/binary-files',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/commands',
        'api/configuration',
      ],
    },
    {
      type: 'category',
      label: 'Troubleshooting',
      items: [
        'troubleshooting/common-issues',
      ],
    },
  ],
};

export default sidebars;
