import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '../../utils/errorMessage';

describe('getErrorMessage', () => {
  it('returns the server message when error has response.data.message string', () => {
    const error = {
      response: {
        data: {
          message: 'Server error message',
        },
      },
    };
    expect(getErrorMessage(error, 'fallback')).toBe('Server error message');
  });

  it('returns fallback when error is null', () => {
    expect(getErrorMessage(null, 'fallback')).toBe('fallback');
  });

  it('returns fallback when error is undefined', () => {
    expect(getErrorMessage(undefined, 'fallback')).toBe('fallback');
  });

  it('returns fallback when error is a plain string', () => {
    expect(getErrorMessage('some error', 'fallback')).toBe('fallback');
  });

  it('returns fallback when error is a number', () => {
    expect(getErrorMessage(42, 'fallback')).toBe('fallback');
  });

  it('returns fallback when error has no response property', () => {
    const error = { message: 'local message' };
    expect(getErrorMessage(error, 'fallback')).toBe('fallback');
  });

  it('returns fallback when error.response is null', () => {
    const error = { response: null };
    expect(getErrorMessage(error, 'fallback')).toBe('fallback');
  });

  it('returns fallback when error.response has no data property', () => {
    const error = { response: { status: 500 } };
    expect(getErrorMessage(error, 'fallback')).toBe('fallback');
  });

  it('returns fallback when error.response.data is null', () => {
    const error = { response: { data: null } };
    expect(getErrorMessage(error, 'fallback')).toBe('fallback');
  });

  it('returns fallback when error.response.data.message is not a string', () => {
    const error = { response: { data: { message: 42 } } };
    expect(getErrorMessage(error, 'fallback')).toBe('fallback');
  });

  it('returns fallback when error.response.data.message is missing', () => {
    const error = { response: { data: { code: 'NOT_FOUND' } } };
    expect(getErrorMessage(error, 'fallback')).toBe('fallback');
  });

  it('returns server message even when it is an empty string', () => {
    const error = { response: { data: { message: '' } } };
    expect(getErrorMessage(error, 'fallback')).toBe('');
  });

  it('uses the exact fallback string provided', () => {
    expect(getErrorMessage({}, 'Custom fallback text')).toBe('Custom fallback text');
  });
});