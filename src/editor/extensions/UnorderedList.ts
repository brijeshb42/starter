import OrderedList from './OrderedList';

export default class UnorderedList extends OrderedList {
  name = 'unordered_list';
  listTag = 'ul';
  listAttrs = {};
  toggleKey = 'Mod-Alt-8';
}