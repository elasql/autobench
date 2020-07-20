const assert = require('chai').assert;
const { parser } = require('../src/args');

describe('parser', () => {
  describe('init', () => {
    it('should not throw errors in debug mode', () => {
      const args = parser.parseArgs(['-c', 'path', '-D', 'init']);
      assert.equal(args.configPath[0], 'path');
      assert.isTrue(args.debug);
      assert.equal(args.mode, 'init');
    });

    it('should not throw errors in normal mode', () => {
      const args = parser.parseArgs(['-c', 'path', 'init']);
      assert.equal(args.configPath[0], 'path');
      assert.isFalse(args.debug);
      assert.equal(args.mode, 'init');
    });
  });

  describe('load', () => {
    it('should not throw errors', () => {
      const args = parser.parseArgs([
        '-c', 'path', 'load',
        '-d', 'dbName',
        '-j', 'jarsDir',
        '--parameter', 'paramPath',
        '--properties', 'propDir'
      ]);
      assert.equal(args.configPath[0], 'path');
      assert.isFalse(args.debug);
      assert.equal(args.mode, 'load');
      assert.equal(args.jarsDir[0], 'jarsDir');
      assert.equal(args.paramPath[0], 'paramPath');
      assert.equal(args.dbName[0], 'dbName');
      assert.equal(args.propDir[0], 'propDir');
    });
  });

  describe('benchmark', () => {
    it('should not throw errors with -i', () => {
      const args = parser.parseArgs([
        '-c', 'path', 'benchmark',
        '-i',
        '-d', 'dbName',
        '-j', 'jarsDir',
        '--parameter', 'paramPath',
        '--properties', 'propDir'
      ]);
      assert.equal(args.configPath[0], 'path');
      assert.isFalse(args.debug);
      assert.equal(args.mode, 'benchmark');
      assert.isTrue(args.ignore);
      assert.equal(args.paramPath[0], 'paramPath');
      assert.equal(args.dbName[0], 'dbName');
    });

    it('should not throw errors without -i', () => {
      const args = parser.parseArgs([
        '-c', 'path', 'benchmark',
        '-d', 'dbName',
        '-j', 'jarsDir',
        '--parameter', 'paramPath',
        '--properties', 'propDir'
      ]);
      assert.equal(args.configPath[0], 'path');
      assert.isFalse(args.debug);
      assert.equal(args.mode, 'benchmark');
      assert.isFalse(args.ignore);
      assert.equal(args.paramPath[0], 'paramPath');
      assert.equal(args.dbName[0], 'dbName');
    });
  });

  describe('pull', () => {
    it('should not throw errors with -i', () => {
      const args = parser.parseArgs([
        '-c', 'path', 'pull',
        '-s', '-i',
        '-p', 'pattern'
      ]);
      console.log(args);
      assert.equal(args.configPath[0], 'path');
      assert.isFalse(args.debug);
      assert.equal(args.mode, 'pull');
      assert.isTrue(args.seperate);
      assert.isTrue(args.ignore);
      assert.equal(args.pattern[0], 'pattern');
    });

    it('should not throw errors without -i', () => {
      const args = parser.parseArgs([
        '-c', 'path', '-D', 'pull',
        '-p', 'pattern'
      ]);
      assert.equal(args.configPath[0], 'path');
      assert.isTrue(args.debug);
      assert.equal(args.mode, 'pull');
      assert.isFalse(args.seperate);
      assert.isFalse(args.ignore);
      assert.equal(args.pattern[0], 'pattern');
    });
  });
});
