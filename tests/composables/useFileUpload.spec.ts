import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { useFileUpload } from '../../app/composables/useFileUpload';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
}));

describe('useFileUpload Composable', () => {
  beforeEach(() => {
    class MockFileReader {
      onload?: (e: { target: { result: string } }) => void;
      onerror?: (e: Error) => void;
      readAsDataURL(_file: File | Blob) {
        setTimeout(() => {
          if (this.onload)
            this.onload({ target: { result: 'data:image/png;base64,mock' } });
        }, 10);
      }
    }
    window.FileReader = MockFileReader as unknown as typeof FileReader;
  });

  it('validates file type', async () => {
    const onError = vi.fn();
    const onUpload = vi.fn();
    const { onFileSelected } = useFileUpload({ onError, onUpload });

    const file = new File(['dummy content'], 'test.txt', {
      type: 'text/plain',
    });
    const event = { target: { files: [file] } } as unknown as Event;

    onFileSelected(event);
    await flushPromises();

    expect(onError).toHaveBeenCalledWith('profile.avatar.errorType');
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('validates file size', async () => {
    const onError = vi.fn();
    const onUpload = vi.fn();
    const { onFileSelected } = useFileUpload({
      onError,
      onUpload,
      maxSize: 10,
    });

    const file = new File(
      ['dummy content that is definitely more than 10 bytes'],
      'test.png',
      { type: 'image/png' }
    );
    const event = { target: { files: [file] } } as unknown as Event;

    onFileSelected(event);
    await flushPromises();

    expect(onError).toHaveBeenCalledWith('profile.avatar.errorSize');
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('triggers file upload on valid file', async () => {
    const onError = vi.fn();
    const onUpload = vi.fn();
    const { onFileSelected } = useFileUpload({ onError, onUpload });

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const event = { target: { files: [file] } } as unknown as Event;

    onFileSelected(event);

    await new Promise((resolve) => setTimeout(resolve, 50));
    await flushPromises();

    expect(onError).not.toHaveBeenCalled();
    expect(onUpload).toHaveBeenCalledWith(file, 'data:image/png;base64,mock');
  });
});
