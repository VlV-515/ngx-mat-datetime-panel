module.exports = {
  displayName: 'ngx-mat-datetime-panel',
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/projects/ngx-mat-datetime-panel'],
  setupFilesAfterEnv: ['<rootDir>/projects/ngx-mat-datetime-panel/setup-jest.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/projects/ngx-mat-datetime-panel/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
};
