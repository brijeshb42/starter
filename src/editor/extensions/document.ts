import { IExtension, ExtensionType } from '../base';

export default class Document implements IExtension {
  type = ExtensionType.Node;
  name = 'doc';

  getSchema() {
    return {
      content: 'block+',
    };
  }
}
