import { addParameters, configure } from '@storybook/react';

addParameters({
  options: { addonPanelInRight: true }
});

function loadStories() {
  const req = require.context('../src', true, /\.stories\.js$/);

  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
