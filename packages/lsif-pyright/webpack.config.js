/**
 * webpack.config-cli.js
 * Copyright: Microsoft 2018
 */

/* eslint-disable @typescript-eslint/no-var-requires */
//@ts-check

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const { monorepoResourceNameMapper } = require('../../build/lib/webpack');

const outPath = path.resolve(__dirname, 'dist');
const typeshedFallback = path.resolve(__dirname, '..', 'pyright-internal', 'typeshed-fallback');

/**@type {(env: any, argv: { mode: 'production' | 'development' | 'none' }) => import('webpack').Configuration}*/
module.exports = (_, { mode }) => {
    return {
        context: __dirname,
        entry: {
            'lsif-pyright': './src/indexer.ts',
        },
        target: 'node',
        output: {
            filename: '[name].js',
            path: outPath,
            devtoolModuleFilenameTemplate:
                mode === 'development' ? '../[resource-path]' : monorepoResourceNameMapper('lsif-pyright'),
            clean: true,
        },
        devtool: mode === 'development' ? 'inline-source-map' : 'nosources-source-map',
        stats: {
            all: false,
            errors: true,
            warnings: true,
        },
        resolve: {
            extensions: ['.ts', '.js'],
            plugins: [
                new TsconfigPathsPlugin({
                    configFile: 'tsconfig.withBaseUrl.json', // TODO: Remove once the plugin understands TS 4.1's implicit baseUrl.
                    extensions: ['.ts', '.js'],
                }),
            ],
        },
        externals: {
            fsevents: 'commonjs2 fsevents',
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: 'ts-loader',
                    options: {
                        configFile: 'tsconfig.json',
                    },
                },
            ],
        },
        plugins: [new CopyPlugin({ patterns: [{ from: typeshedFallback, to: 'typeshed-fallback' }] })],
        optimization: {
            splitChunks: {
                cacheGroups: {
                    defaultVendors: {
                        name: 'vendor',
                        test: /[\\/]node_modules[\\/]/,
                        chunks: 'all',
                        priority: -10,
                    },
                    pyright: {
                        name: 'pyright-internal',
                        chunks: 'all',
                        test: /[\\/]pyright-internal[\\/]/,
                        priority: -20,
                    },
                },
            },
        },
    };
};
