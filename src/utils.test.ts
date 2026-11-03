import { describe, it, expect, vi } from 'vitest';
import { formatCurrency, truncateText, validateEmail, debounce }
from './utils';

describe('formatCurrency', () => {
  it('chứa số tiền đã định dạng và ký hiệu tiền tệ', () => {
    const result = formatCurrency(150000);
    expect(result.replace(/\s/g, '')).toContain('150.000');
    expect(result).toMatch(/₫|VND/);
  });
});

describe('truncateText', () => {
  it('giữ nguyên chuỗi nếu ngắn hơn maxLength', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });
  it('cắt ngắn và thêm ... nếu dài hơn maxLength', () => {
    expect(truncateText('Hello world', 5)).toBe('Hello...');
  });
});

describe('validateEmail', () => {
  it('true với email hợp lệ', () => {
    expect(validateEmail('abc@example.com')).toBe(true);
  });
  it('false với email không hợp lệ', () => {
    expect(validateEmail('abc@com')).toBe(false);
  });
});

describe('debounce', () => {
  it('chỉ gọi hàm 1 lần sau nhiều lần gọi liên tiếp', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    debounced(); debounced(); debounced();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
