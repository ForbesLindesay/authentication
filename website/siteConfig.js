/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

process.on('unhandledRejection', e => {
  console.error(e.stack || e.message || e);
  process.exit(1);
});

/* List of projects/orgs using your project for the users page */
const users = [
  // {
  //   caption: 'User1',
  //   image: '/test-site/img/docusaurus.svg',
  //   infoLink: 'https://www.facebook.com',
  //   pinned: true,
  // },
];

const siteConfig = {
  title: 'authentication' /* title for your website */,
  tagline: 'Open source security libraries for node.js',
  url: 'https://www.atauthentication.com' /* your website url */,
  baseUrl: '/' /* base url for your project */,
  projectName: 'authentication',
  ogImage: 'img/ogImage.png',
  headerLinks: [
    {doc: 'getting-started', label: 'Docs'},
    // {doc: 'doc4', label: 'API'},
    {page: 'help', label: 'Help'},
    {blog: true, label: 'Blog'},
  ],
  users,
  /* path to images for header/footer */
  headerIcon: 'img/WhiteShield.svg',
  footerIcon: 'img/favicon.png',
  favicon: 'img/favicon.png',
  /* colors for website */
  colors: {
    primaryColor: '#1400FF',
    secondaryColor: '#0A007C',
  },
  // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
  copyright: 'Copyright © ' + new Date().getFullYear() + ' Forbes Lindesay',
  // organizationName: 'deltice', // or set an env variable ORGANIZATION_NAME
  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks
    theme: 'default',
  },
  scripts: ['/js/language-switcher.js', 'https://buttons.github.io/buttons.js'],
  // You may provide arbitrary config keys to be used as needed by your template.
  repoUrl: 'https://github.com/ForbesLindesay/authentication',

  gaTrackingId: 'UA-31798041-11',
};

module.exports = siteConfig;
