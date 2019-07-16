import { addParameters, configure } from '@storybook/react';

addParameters({
  options: { panelPosition: 'right' }
});

function loadStories() {
  const req = require.context('../src', true, /\.stories\.js$/);

  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
