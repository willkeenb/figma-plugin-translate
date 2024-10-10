const preact = jest.requireActual('preact');

module.exports = {
  ...preact,
  useEffect: jest.fn(),
  useState: jest.fn(),
};