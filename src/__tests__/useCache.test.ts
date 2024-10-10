import { renderHook } from '@testing-library/preact-hooks';
import useCache from '../ui/hooks/useCache';


describe('useCache', () => {
  it('should return loadCacheFromDocument and saveCacheToDocument functions', () => {
    const { result } = renderHook(() => useCache());
    
    expect(result.current).toBeDefined();
    
    if (result.current) {
      const cache = result.current as ReturnType<typeof useCache>;
      expect(cache.loadCacheFromDocument).toBeDefined();
      expect(cache.saveCacheToDocument).toBeDefined();
    } else {
      fail('useCache hook returned undefined');
    }
  });
});
