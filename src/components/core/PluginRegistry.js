const plugins = {};
const extensionCache = {};

class PluginRegistry {
  static register(plugin) {
    plugins[plugin.key] = plugin;
    this.resetExtenstionCache();
  }

  static extensions(extensionKey) {
    if (extensionCache[extensionKey] == undefined) {
      const extensions = [];
      this.allPlugins().forEach(plugin => {
        const currentExtensions = plugin.extensions[extensionKey] || [];
        if (currentExtensions) {
          extensions.push(...currentExtensions);
        }
      }, []);
      extensionCache[extensionKey] = extensions;
    }
    return extensionCache[extensionKey];
  }

  static allPlugins() {
    return Object.keys(plugins).map(pluginKey => plugins[pluginKey]);
  }

  static resetExtenstionCache() {
    var pluginKeys = Object.keys(extensionCache);
    for (var i = 0; i < pluginKeys.length; i++) {
      delete extensionCache[pluginKeys[i]];
    }
  }
}

export default PluginRegistry;
