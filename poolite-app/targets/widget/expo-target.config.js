/** @type {import('@bacons/apple-targets').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'PooliteWidget',
  deploymentTarget: '17.0',
  colors: {
    $widgetBackground: '#F2F8FA',
    $accent: '#0E5A6D',
  },
  entitlements: {
    'com.apple.security.application-groups': ['group.it.poolite.app'],
  },
});
