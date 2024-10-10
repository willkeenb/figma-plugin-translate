import applyKeyValue from '../main/applyKeyValue';
import { PluginAPI, TextNode } from '@/types';


jest.mock('@create-figma-plugin/utilities', () => ({
  loadFontsAsync: jest.fn().mockResolvedValue(undefined),
}));


// Мок для глобального объекта figma
const mockFigma: Partial<PluginAPI> = {
  currentPage: {
    selection: []
  },
  notify: jest.fn()
};

// Устанавливаем глобальный объект figma перед каждым тестом
beforeEach(() => {
  (global as any).figma = mockFigma;
  jest.resetAllMocks();
});

describe('applyKeyValue', () => {
  it('должен применять значение к выбранному текстовому слою', () => {
    const mockTextNode: Partial<TextNode> = {
      type: 'TEXT',
      characters: '',
      id: '1',
      name: 'Text',
      clone: jest.fn().mockReturnThis(),
      textAlignHorizontal: 'LEFT',
      textAlignVertical: 'TOP',
      textAutoResize: 'NONE',
    };
    mockFigma.currentPage!.selection = [mockTextNode as TextNode];

    applyKeyValue({
      key: 'testKey',
      value: 'testValue',
      id: '1',
      valueRu: '',
      valueUz: '',
      created_time: '',
      last_edited_time: '',
      url: ''
    });

    expect(mockTextNode.characters).toBe('testValue');
  });

  it('должен показывать уведомление, если нет выбранных слоев', () => {
    mockFigma.currentPage!.selection = [];

    applyKeyValue({
      key: 'testKey',
      value: 'testValue',
      id: '',
      valueRu: '',
      valueUz: '',
      created_time: '',
      last_edited_time: '',
      url: ''
    });

    expect(mockFigma.notify).toHaveBeenCalledWith(expect.any(String));
  });
});
