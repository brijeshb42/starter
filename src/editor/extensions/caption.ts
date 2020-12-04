import {
  NodeSpec,
} from 'prosemirror-model';

import { IExtension, ExtensionType } from '../base';

export default class QuoteCaption implements IExtension {
  type = ExtensionType.Node;
  name = 'quoteCaption';

  getSchema() {
    return {
      attrs: {},
      content: 'inline*',
      group: 'block',
      parseDOM: [{
        tag: 'caption[data-quotecaption]',
      }],
      defining: true,
      toDOM() {
        return ['caption', {
          'data-quotecaption': 'true',
        }, 0];
      },
    } as NodeSpec;
  }
}