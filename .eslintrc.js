module.exports = {
    env: {
        commonjs: true,
        es6: true,
        mocha: true,
        node: true
    },
    extends: ['standard'],
    parserOptions: {
        ecmaVersion: 2018
    },
    rules: {
        indent: ['error', 4],
        semi: [0]
    }
};
