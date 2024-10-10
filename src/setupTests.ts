import '@testing-library/jest-dom';
import { configure } from '@testing-library/preact';
import 'preact/compat';

configure({ asyncUtilTimeout: 5000 });

import * as preact from 'preact';
import * as preactHooks from 'preact/hooks';

import * as React from 'preact/compat';
global.React = React as any;