
function getComponentProps(prop) {
    if (prop && typeof prop === 'object') {
        return prop;
    }
    return {};
}

export {
    getComponentProps,
}