import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import { uglify } from "rollup-plugin-uglify";
import json from "rollup-plugin-json";

export default [
    {
        input: "currencies.json",
        output: {
            file: "json/currencies.js",
            format: "cjs",
            name: "currencies"
        },
        plugins: [
            json({
                namedExports: false,
                exclude: "node_modules/**"
            })
        ]
    },
    {
        input: "localeFormats.json",
        output: {
            file: "json/localeFormats.js",
            format: "cjs",
            name: "localeFormats"
        },
        plugins: [
            json({
                namedExports: false,
                exclude: "node_modules/**"
            })
        ]
    },
    {
        input: "index.js",
        output: {
            file: "dist/js/currencyFormatter.js",
            format: "umd",
            name: "currencyFormatter",
            sourcemap: true,
            exports: "named"
        },
        plugins: [
            resolve({
                customResolveOptions: {
                    moduleDirectory: "node_modules"
                }
            }),
            commonjs(),
            babel({
                exclude: "node_modules/**"
            })
        ]
    },
    {
        input: "index.js",
        output: {
            file: "dist/js/currencyFormatter.min.js",
            format: "umd",
            name: "currencyFormatter",
            exports: "named"
        },
        plugins: [
            resolve({
                customResolveOptions: {
                    moduleDirectory: "node_modules"
                }
            }),
            commonjs(),
            babel({
                exclude: "node_modules/**"
            }),
            uglify()
        ]
    }
]