import { ExtensionType, IExtension } from '../base';

export default class Text implements IExtension {
  type = ExtensionType.Node;
  name = 'text';

  getSchema() {
    return {
      group: 'inline',
    };
  }
}