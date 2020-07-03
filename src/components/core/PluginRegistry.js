const plugins = {};
let extensionCache = {};

class PluginRegistry {
  static register(plugin) {
    plugins[plugin.key] = plugin;
    this.resetExtenstionCache();
  }

  static extensions(extensionKey) {
    if (extensionCache[extensionKey] == undefined) {
      const extensions = [];
      this.allPlugins().forEach((plugin) => {
        if (plugin.extensions === undefined) {
          throw new Error("plugin doens't have extensions" + plugin);
        }
        const currentExtensions = plugin.extensions[extensionKey] || [];
        if (currentExtensions) {
          extensions.push(...currentExtensions);
        }
      }, []);
      extensionCache[extensionKey] = extensions;
    }
    return extensionCache[extensionKey];
  }

  static extension(extensionKey) {
    return this.extensions(extensionKey)[0]
  }

  static allPlugins() {
    return Object.keys(plugins).map((pluginKey) => plugins[pluginKey]);
  }

  static resetExtenstionCache() {
    extensionCache = {};
  }
}

export default PluginRegistry;
