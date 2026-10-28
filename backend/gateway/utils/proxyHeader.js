export const proxyReqOptDecorator = (proxyReqOpts, req) => {
    if (!proxyReqOpts.headers) {
        proxyReqOpts.headers = {};
    }
    if (req.user) {
        proxyReqOpts.headers['x-user-id'] = req.user._id?.toString() || req.user.id || req.user.userId || '';
    }
    return proxyReqOpts;
};

export const proxyWithHeader = (proxyReqOptsOrOptions, req) => {
    if (proxyReqOptsOrOptions && typeof proxyReqOptsOrOptions === 'object' && 'headers' in proxyReqOptsOrOptions) {
        return proxyReqOptDecorator(proxyReqOptsOrOptions, req);
    }
    return {
        proxyReqOptDecorator,
    };
};