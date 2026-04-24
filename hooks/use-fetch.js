export function useFetch() {
  return {
    data: null,
    loading: false,
    error: null,
    fn: () => Promise.resolve()
  };
}