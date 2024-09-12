#!/usr/bin/env node
import { render } from 'ink';
import App from './app.js';
import React from 'react';

render(
  <App />,
  {
    exitOnCtrlC: false,
  }
);
