// Stub hook to allow build to complete
export function useFetch() {
  return {
    data: null,
    loading: false,
    error: null,
    fn: () => {}
  };
}