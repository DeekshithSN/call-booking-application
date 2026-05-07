"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addProjectDependencies = addProjectDependencies;
const devkit_1 = require("@nx/devkit");
const versions_1 = require("@nx/js/src/utils/versions");
const versions_2 = require("../../../utils/versions");
function addProjectDependencies(tree, options) {
    const bundlers = {
        webpack: {
            '@nx/webpack': versions_2.nxVersion,
        },
        esbuild: {
            '@nx/esbuild': versions_2.nxVersion,
            esbuild: (0, devkit_1.getDependencyVersionFromPackageJson)(tree, 'esbuild') ?? versions_1.esbuildVersion,
        },
    };
    const frameworkDependencies = {
        express: {
            express: versions_2.expressVersion,
        },
        koa: {
            koa: versions_2.koaVersion,
        },
        fastify: {
            fastify: versions_2.fastifyVersion,
            'fastify-plugin': versions_2.fastifyPluginVersion,
            '@fastify/autoload': versions_2.fastifyAutoloadVersion,
            '@fastify/sensible': versions_2.fastifySensibleVersion,
        },
    };
    const frameworkDevDependencies = {
        express: {
            '@types/express': versions_2.expressTypingsVersion,
        },
        koa: {
            '@types/koa': versions_2.koaTypingsVersion,
        },
        fastify: {},
    };
    return {
        installTask: (0, devkit_1.addDependenciesToPackageJson)(tree, {
            ...frameworkDependencies[options.framework],
            tslib: versions_2.tslibVersion,
        }, {
            ...frameworkDevDependencies[options.framework],
            ...bundlers[options.bundler],
            '@types/node': versions_2.typesNodeVersion,
        }),
        frameworkDependencies: frameworkDependencies[options.framework],
    };
}
