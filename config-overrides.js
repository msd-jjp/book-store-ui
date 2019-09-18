module.exports = function override(config, env) {
    config.module.rules.push({
        test: /\.worker\.ts$/,
        use: { loader: 'worker-loader' },
    })
    // config.output.globalObject = self;
    // config.output.globalObject = this;
    config.output.globalObject = "this";
    // output.globalObject = "this"
    
    return config;
}