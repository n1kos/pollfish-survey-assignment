export class Utils {
  public debounce = (func: Function, wait: number) => {
    return function executedFunction(...args: []) {
      // eslint-disable-next-line prefer-const
      let timeout: ReturnType<typeof setTimeout> | null;
      const later = () => {
        timeout = null;
        func(...args);
      };
      //@ts-expect-error use-before-assign
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
}
