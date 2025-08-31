import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Rune',
  tagline: 'Version control, finally simplified',
  favicon: 'img/favicon.ico',

  // Future flags for Docusaurus v4 compatibility
  future: {
    v4: true,
  },

  // Production deployment configuration
  url: 'https://captainotlo.github.io',
  baseUrl: '/rune-vcs/',

  // GitHub pages deployment config.
  // GitHub deployment configuration
  organizationName: 'CaptainOtto',
  projectName: 'rune-vcs',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Internationalization configuration
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Edit URL for our repository
          editUrl:
            'https://github.com/CaptainOtto/rune-vcs/tree/main/docs-site/docs/',
        },
        blog: false, // Disable blog functionality
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/rune-vcs-social-card.jpg',
    // Force dark mode to match visual client aesthetic
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: '',
      logo: {
        alt: 'Rune VCS',
        src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDNMMTggOUwxMiAxNUw2IDlMMTIgM1oiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMTIgOUwxMiAyMU05IDEyTDE1IDEyIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjkiIHI9IjEuNSIgZmlsbD0iY3VycmVudENvbG9yIi8+Cjwvc3ZnPgo=',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/installation/quick-start',
          label: 'Quick Start',
          position: 'left'
        },
        {
          href: 'https://github.com/CaptainOtto/rune-vcs/releases',
          label: 'Download',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'Installation',
              to: '/docs/installation/quick-start',
            },
            {
              label: 'API Reference',
              to: '/docs/api',
            },
          ],
        },
        {
          title: 'Features',
          items: [
            {
              label: 'Natural Language Commands',
              to: '/docs/features/natural-language',
            },
            {
              label: 'AI-Powered Operations',
              to: '/docs/features/ai-commands',
            },
            {
              label: 'Binary Management',
              to: '/docs/features/binary-management',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Issues',
              href: 'https://github.com/CaptainOtto/rune-vcs/issues',
            },
            {
              label: 'Discussions',
              href: 'https://github.com/CaptainOtto/rune-vcs/discussions',
            },
            {
              label: 'Release Notes',
              to: '/blog',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub Repository',
              href: 'https://github.com/CaptainOtto/rune-vcs',
            },
            {
              label: 'Download Latest',
              href: 'https://github.com/CaptainOtto/rune-vcs/releases',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Rune VCS. Revolutionary AI-Powered Version Control.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
