export interface PluginAPI {
  currentPage: {
    selection: any[];
  };
  notify: (message: string) => void;
}

export interface TextNode {
  type: 'TEXT';
  characters: string;
  id: string;
  name: string;
  clone: () => TextNode;
  textAlignHorizontal: string;
  textAlignVertical: string;
  textAutoResize: string;
}
