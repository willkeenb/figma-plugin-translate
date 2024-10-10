import { jest } from '@jest/globals';

export const loadFontsAsync = jest.fn().mockImplementation(() => new Promise(() => {}));
export const showUI = jest.fn()
export const on = jest.fn()
export const once = jest.fn()
export const emit = jest.fn()
