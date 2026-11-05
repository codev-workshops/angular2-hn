// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    // Instrumentation excludes live in angular.json (test.options.codeCoverageExclude);
    // this reporter only reports and enforces thresholds.
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, './coverage/angular-hnpwa'),
      reports: ['html', 'lcovonly', 'text', 'text-summary'],
      fixWebpackSourcePaths: true,
      thresholds: {
        emitWarning: false,
        global: {
          statements: 95,
          lines: 95,
          functions: 95,
          branches: 85
        }
      }
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu']
      }
    },
    singleRun: false,
    restartOnFileChange: true
  });
};
