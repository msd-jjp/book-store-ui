// import './public-path';
// const multi = require('multi-loader');

module.exports = function override(config, env) {
    // config.module.rules.push({
    //     test: /\.worker\.ts$/,
    //     use: { loader: 'worker-loader' },
    // })

    // config.module.rules.push({
    //     test: /\.worker\.ts$/,
    //     use: {
    //         loader: multi(
    //             // 'ts-loader',
    //             'worker-loader',
    //             // 'ts-loader'
    //         )
    //     },
    // })

    // config.module.rules.push({
    //     test: /\.worker\.js$/,
    //     use: { loader: 'ts-loader' },
    // })
    config.module.rules.unshift({
        test: /\.worker\.ts$/,
        use: { loader: 'worker-loader' },
    })
    

    // config.module.rules.push({
    //     test: /\.tsx?$/,
    //     loader: 'ts-loader',
    //     exclude: /node_modules/,
    //     options: { projectReferences: true }
    // })

    // config.module.rules.push({
    //     test: /\.worker.ts$/,
    //     use: [
    //         {
    //             // loader: require.resolve('worker-loader'),
    //             loader: require.resolve('ts-loader'),
    //             options: {
    //                 name: 'static/js/[name].js',
    //                 publicPath: '/',
    //             },
    //         },
    //         // TS_LOADER,
    //     ],
    // })

    // config.output.globalObject = self;
    // config.output.globalObject = this;
    config.output.globalObject = "this";
    // output.globalObject = "this"

    return config;
}